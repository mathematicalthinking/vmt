import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import findLast from 'lodash/findLast';
import startCase from 'lodash/startCase';
import difference from 'lodash/difference';
import find from 'lodash/find';
import classes from './graph.css';
import ControlWarningModal from './ControlWarningModal';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests';
import CheckboxModal from '../../Components/UI/Modal/CheckboxModal';

class DesmosGraph extends Component {
  state = {
    showControlWarning: false,
    showRefWarning: false,
    doPreventFutureRefWarnings: false,
  };
  // Because DESMOS controls its own state we're keeping much of our "state" outside of the actual react.this.state
  // this is because we don't want to trigger rerenders...desmos does this. Yeah, yeah. yeah...this is not the react way,
  // but we're limited by Desmos and ggb
  expressionList = [];
  receivingData = false;
  graph = {};
  undoing = false;
  calculatorRef = React.createRef();
  refWarningMsg =
    'Whiteboard referencing is currently not supported for Desmos rooms';
  whiteboardSel = '.dcg-grapher';

  debouncedUpdate = debounce(
    () => {
      const { tab } = this.props;
      const currentStateString = JSON.stringify(this.calculator.getState());
      // updateRoomTab(room._id, tab._id, {
      //   currentState: currentStateString,
      // });
      const currentState = currentStateString;
      const { _id } = tab;
      API.put('tabs', _id, { currentState })
        .then(() => {})
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    },
    // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
    2000,
    { trailing: true, leading: false }
  );

  componentDidMount() {
    const { tab, setFirstTabLoaded } = this.props;
    window.addEventListener('keydown', this.allowKeypressCheck);
    // If we have multiple desmos tabs we'll already have a Desmos object attached to the window
    // and thus we dont need to load the desmos script. Eventually abstract out the commonalities
    // between didMount and onScriptLoad into its own function to make it more DRY...but not till
    // this component is more stable
    if (window.Desmos) {
      this.initializing = true;
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
      this.initializeListeners();
      if (tab.currentState) {
        this.calculator.setState(tab.currentState);
      } else if (tab.desmosLink) {
        API.getDesmos(tab.desmosLink)
          .then((res) => {
            this.calculator.setState(res.data.result.state);
            this.initializeListeners();
          })
          // eslint-disable-next-line no-console
          .catch((err) => console.log(err));
      }
      setFirstTabLoaded();
      const desmosState = this.calculator.getState();
      this.expressionList = desmosState.expressions.list;
      this.graph = desmosState.graph;
      this.initializing = false;
    }
  }

  // componentDidUpdate(prevProps) {
  // if (prevProps.currentTab !== this.props.currentTab) {
  //   this.setState({ receivingEvent: true }, () => {
  //     let { room, currentTab } = this.props;
  //     let { tabs } = room;
  //     if (tabs[currentTab].currentState) {
  //       this.calculator.setState(tabs[currentTab].currentState);
  //     } else if (tabs[currentTab].desmosLink) {
  //       API.getDesmos(tabs[currentTab].desmosLink)
  //         .then(res => {
  //           this.calculator.setState(res.data.result.state);
  //           this.initializeListeners();
  //         })
  //         .catch(err => console.log(err));
  //     }
  //   });
  // }
  // const { inControl } = this.props;
  // if (inControl === 'ME') {
  // this.setState({ showControlWarning: true });
  // }
  // }
  componentWillUnmount() {
    this.removeWhiteBoardListener('click', this.refWarningHandler);

    if (this.calculator) {
      this.calculator.unobserveEvent('change');
      this.calculator.destroy();
    }
    window.removeEventListener('keydown', this.allowKeypressCheck);
    socket.removeAllListeners('RECEIVE_EVENT');
  }

  allowKeypressCheck = (event) => {
    const { showControlWarning } = this.state;
    if (showControlWarning) {
      event.preventDefault();
    }
  };

  onScriptLoad = () => {
    const { tab, setFirstTabLoaded } = this.props;
    const { desmosLink, currentState } = tab;
    this.initializing = true;
    if (!this.calculator) {
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
    }
    if (currentState) {
      try {
        this.calculator.setState(currentState);
        this.initializeListeners();
      } catch (err) {
        // eslint-disable-next-line no-alert
        window.alert('the state of this room has been corrupted :(');
      }
    } else if (desmosLink) {
      // @TODO This will require some major reconfiguration / But what we shoould do is
      // when the user creates this room get teh state from the link and then just save it
      // as as event on this model.
      API.getDesmos(desmosLink)
        .then((res) => {
          try {
            this.calculator.setState(res.data.result.state);
          } catch (err) {
            // eslint-disable-next-line no-alert
            window.alert('the state of this room has been corrupted :(');
          }
          // console.
          this.initializeListeners();
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err));
    } else {
      this.initializeListeners();
    }
    const desmosState = this.calculator.getState();
    this.expressionList = desmosState.expressions.list;
    this.graph = desmosState.graph;
    setFirstTabLoaded();
    this.initializing = false;
  };

  addWhiteBoardListener = (eventType, handler) => {
    const whiteboard = document.querySelector(this.whiteboardSel);

    if (whiteboard) {
      whiteboard.addEventListener(eventType, handler);
    }
  };

  removeWhiteBoardListener = (eventType, handler) => {
    const whiteboard = document.querySelector(this.whiteboardSel);

    if (whiteboard) {
      whiteboard.removeEventListener(eventType, handler);
    }
  };

  refWarningHandler = () => {
    const { referencing } = this.props;

    if (referencing) {
      this.setState({ showRefWarning: true });
    }
  };

  closeRefWarning = () => {
    const { doPreventFutureRefWarnings } = this.state;

    if (doPreventFutureRefWarnings) {
      // update user's settings and remove listener
      const { user } = this.props;
      if (user) {
        this.removeWhiteBoardListener('click', this.refWarningHandler);
        const { updateUserSettings } = this.props;

        const { settings: userSettings } = user;

        const updatedSettings = {
          ...userSettings,
          doShowDesmosRefWarning: false,
        };
        updateUserSettings(user._id, { settings: updatedSettings });
      }
    }

    this.setState({ showRefWarning: false });
  };

  togglePreventRefWarning = () => {
    const { doPreventFutureRefWarnings } = this.state;
    this.setState({
      doPreventFutureRefWarnings: !doPreventFutureRefWarnings,
    });
  };

  findDifferentExpression = (newExpressions, oldExpressions, diffType) => {
    if (diffType === 'add') {
      // start from end of newExpressions and check if was in oldExpressions
      return findLast(newExpressions, (newExpression) => {
        return !find(oldExpressions, (oldExpression) => {
          return isEqual(oldExpression, newExpression);
        });
      });
    }

    if (diffType === 'removal') {
      // start from end of oldExpressions and check if in new expressions
      return findLast(oldExpressions, (oldExpression) => {
        return !find(newExpressions, (newExpression) => {
          return isEqual(oldExpression, newExpression);
        });
      });
    }
    return null;
  };

  buildDescription = (username, eventDetails) => {
    const { expression, actionType } = eventDetails;

    if (expression) {
      // expression was either added, removed, or modified
      const { type } = expression;
      let content;

      if (type === 'expression') {
        content = expression.latex
          ? `expression ${expression.latex}`
          : 'a blank expression';
      } else if (type === 'text') {
        content = expression.text
          ? `the note ${expression.text}`
          : 'a blank note';
      } else if (type === 'table') {
        const { id } = expression;
        // should use the index in the expression list because the user will
        // not know what the id refers to
        const expressionIx = this.getExpressionListIxFromId(id);
        content = `table ${id} (expression #${expressionIx + 1})`;
      } else if (type === 'folder') {
        // const memberIds = { expression };

        // const numItems = memberIds ? Object.keys(memberIds).length : 0;

        content = expression.title
          ? `folder ${expression.title}`
          : 'an unnamed folder';
      } else if (type === 'image') {
        content = expression.name
          ? `image ${expression.name}`
          : 'an untitled imaged';
      }

      if (actionType === 'add' || actionType === 'removal') {
        const verb = actionType === 'add' ? 'added' : 'removed';
        return `${username} ${verb} ${content}`;
      }
      // modify

      const { modifiedExpressionProp } = eventDetails;
      let { oldValue, newValue } = eventDetails;
      let verbPhrase = 'modified';
      let valuesDescriptionPhrase = '';
      if (modifiedExpressionProp === 'hidden') {
        verbPhrase = newValue ? 'hid' : 'unhid';
      } else if (modifiedExpressionProp === 'collapsed') {
        verbPhrase = newValue ? 'collapsed' : 'expanded';
      } else if (modifiedExpressionProp === 'columns') {
        if (newValue.length > oldValue.length) {
          verbPhrase = 'added a column to';
        } else if (oldValue.length > newValue.length) {
          verbPhrase = 'removed a column from';
        } else {
          verbPhrase = 'modified a column from';
        }
      } else {
        verbPhrase = `changed the ${modifiedExpressionProp} of`;

        if (oldValue === undefined) {
          if (modifiedExpressionProp === 'latex') {
            oldValue = 'blank';
          } else if (modifiedExpressionProp === 'lineStyle') {
            oldValue = 'SOLID';
          }
        }

        if (newValue === undefined) {
          if (modifiedExpressionProp === 'latex') {
            newValue = 'blank';
          } else if (modifiedExpressionProp === 'lineStyle') {
            newValue = 'SOLID';
          }
        }
        valuesDescriptionPhrase = ` from ${oldValue} to ${newValue}`;
      }
      return `${username} ${verbPhrase} ${content}${valuesDescriptionPhrase}`;
    }

    const { modifiedGraphProp, newValue, oldValue } = eventDetails;

    let verbPhrase = `modified ${modifiedGraphProp}`;

    const showHideProps = [
      'showGrid',
      'showXAxis',
      'showYAxis',
      'xAxisNumbers',
      'yAxisNumbers',
      'polarNumbers',
      'xAxisMinorSubdivisions',
      'yAxisMinorSubdivisions',
    ];
    if (modifiedGraphProp === 'degreeMode') {
      const displayValue = newValue ? 'degrees mode' : 'radians mode';
      verbPhrase = `switched to ${displayValue}`;
    } else if (modifiedGraphProp === 'polarMode') {
      const displayValue = newValue ? 'polar grid mode' : 'regular grid mode';
      verbPhrase = `switched to ${displayValue}`;
    } else if (showHideProps.indexOf(modifiedGraphProp) !== -1) {
      let verb = !newValue ? 'hid' : 'unhid';

      let noun;
      const target = 'show';
      const showIx = modifiedGraphProp.indexOf(target);
      if (showIx !== -1) {
        noun = modifiedGraphProp.slice(target.length).toLowerCase();
      } else if (modifiedGraphProp.indexOf('Numbers') !== -1) {
        noun = 'axis numbers';
      } else if (modifiedGraphProp.indexOf('Minor') !== -1) {
        if (newValue === 1) {
          verb = 'hid';
        } else {
          verb = 'unhid';
        }
        noun = 'minor gridlines';
      }
      verbPhrase = `${verb} the ${noun}`;
    } else if (modifiedGraphProp.indexOf('ArrowMode') !== -1) {
      if (newValue === undefined) {
        verbPhrase = 'hid the axis arrows';
      } else if (newValue === 'BOTH') {
        verbPhrase = 'switched to displaying positive and negative axis arrows';
      } else {
        verbPhrase = 'switched to displaying only positive axis arrows';
      }
    } else if (modifiedGraphProp.indexOf('Label') !== -1) {
      const noun = startCase(modifiedGraphProp).toLowerCase();

      if (newValue === undefined) {
        verbPhrase = `removed the ${noun}`;
      } else if (oldValue === undefined) {
        verbPhrase = `added ${noun} of ${newValue}`;
      } else {
        verbPhrase = `changed the ${noun} from ${oldValue} to ${newValue}`;
      }
    } else if (modifiedGraphProp.indexOf('Step') !== -1) {
      const noun = startCase(modifiedGraphProp).toLowerCase();

      if (newValue === undefined) {
        verbPhrase = `reset the ${noun}`;
      } else {
        verbPhrase = `set the ${noun} to ${newValue}`;
      }
    }
    return `${username} ${verbPhrase}`;
  };

  getExpressionListIxFromId = (expressionId) => {
    for (let i = 0; i < this.expressionList.length; i++) {
      if (expressionId === this.expressionList[i].id) {
        return i;
      }
    }
    return null;
  };

  initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog } = this.props;
    this.calculator.observeEvent('change', () => {
      const { emitEvent, user, inControl } = this.props;
      if (this.initializing) return;
      if (this.undoing) {
        this.undoing = false;
        return;
      }
      const currentState = this.calculator.getState();
      if (!this.receivingData) {
        const stateDifference = this.areDesmosStatesEqual(currentState);
        if (stateDifference === null) return;
        // we only want to listen for changes to the expressions. i.e. we want to ignore zoom-in-out changes
        if (inControl !== 'ME') {
          this.undoing = true;
          document.activeElement.blur(); // prevent the user from typing anything else N.B. this isnt actually preventing more typing it just removes the cursor
          // we have the global keypress listener to prevent typing if controlWarning is being shown
          this.setState({ showControlWarning: true });
          return;
        }
        const description = this.buildDescription(
          user.username,
          stateDifference
        );
        const currentStateString = JSON.stringify(currentState);
        // console.log(this.calculator.getState());
        const newData = {
          currentState: currentStateString, // desmos events use the currentState field on Event model
          description,
        };
        // Update the instanvce variables tracking desmos state so they're fresh for the next equality check
        emitEvent(newData);
        // if (this.debouncedUpdate) {
        //   this.debouncedUpdate.cancel();
        // }
        this.debouncedUpdate();
      }
      this.expressionList = currentState.expressions.list;
      this.graph = currentState.graph;
      this.receivingData = false;
    });
    socket.on('RECEIVE_EVENT', (data) => {
      addToLog(data);
      const { room } = this.props;
      this.receivingData = true;
      if (data.tab === tab._id) {
        const updatedTabs = room.tabs.map((t) => {
          if (t._id === data.tab) {
            t.currentState = data.currentState;
          }
          return tab;
        });
        // @TODO why is this method called twice?
        updatedRoom(room._id, { tabs: updatedTabs });
        updatedRoom(room._id, { tabs: updatedTabs });
        this.calculator.setState(data.currentState);
      } else {
        addNtfToTabs(data.tab);
        this.receivingData = false;
      }
    });

    const { user: propsUser } = this.props;
    const { settings } = propsUser;
    const doShowDesmosRefWarning = settings && settings.doShowDesmosRefWarning;

    if (doShowDesmosRefWarning) {
      this.addWhiteBoardListener('click', this.refWarningHandler);
    }
  }

  /**
   * @method areDesmosStatesEqual
   * @param  {Object} newState - desmos state object return from desmos.getState
   * @return {Boolean} statesAreEqual
   * @description - compares the previous desmos state (stored as in instance variable) with the newState argument
   * It ignores changes to graph.viewport because we want users who are not in control to still be able to zoom in and out
   */
  areDesmosStatesEqual(newState) {
    if (newState.expressions.list.length !== this.expressionList.length) {
      // return removed or added expressions
      const wasExpressionRemoved =
        newState.expressions.list.length < this.expressionList.length;

      const diffType = wasExpressionRemoved ? 'removal' : 'add';

      const expression = this.findDifferentExpression(
        newState.expressions.list,
        this.expressionList,
        diffType
      );
      return {
        expression,
        actionType: diffType,
      };
    }
    const currentGraphProps = Object.getOwnPropertyNames(newState.graph);
    const prevGraphProps = Object.getOwnPropertyNames(this.graph);

    if (currentGraphProps.length !== prevGraphProps.length) {
      const wasRemoved = currentGraphProps.length < prevGraphProps.length;
      const diffProps = wasRemoved
        ? difference(prevGraphProps, currentGraphProps)
        : difference(currentGraphProps, prevGraphProps);

      const [diffProp] = diffProps;
      if (diffProp !== 'squareAxes') {
        return {
          modifiedGraphProp: diffProp,
          oldValue: this.graph[diffProp],
          newValue: newState.graph[diffProp],
        };
      }
    }
    // I'm okay with this O(a*b) because a SHOULD never be longer than 100 (and is usually closer to 10) and b never more than 4
    // If these assumptions change in the future we may need to refactor
    for (let i = 0; i < this.expressionList.length; i++) {
      const currentExpressionProps = Object.getOwnPropertyNames(
        newState.expressions.list[i]
      );
      const prevExpressionsProps = Object.getOwnPropertyNames(
        this.expressionList[i]
      );
      if (currentExpressionProps.length !== prevExpressionsProps.length) {
        const werePropertiesRemoved =
          currentExpressionProps.length < prevExpressionsProps.length;

        const diffProps = werePropertiesRemoved
          ? difference(prevExpressionsProps, currentExpressionProps)
          : difference(currentExpressionProps, prevExpressionsProps);

        const results = {
          expression: newState.expressions.list[i],
          actionType: 'modify',
          expressionPropActionType: werePropertiesRemoved ? 'removal' : 'add',
        };

        if (diffProps.length === 1) {
          const [diffProp] = diffProps;
          results.oldValue = this.expressionList[i][diffProp];
          results.newValue = newState.expressions.list[i][diffProp];
          results.modifiedExpressionProp = diffProp;
        } else {
          let diffProp;
          if (diffProps.indexOf('type') !== -1) {
            diffProp = 'type';
          } else {
            [diffProp] = diffProps;
          }

          results.oldValue = this.expressionList[i][diffProp];
          results.newValue = newState.expressions.list[i][diffProp];
          results.modifiedExpressionProp = diffProp;
        }

        return results;
      }
      for (let x = 0; x < currentExpressionProps.length; x++) {
        const propName = currentExpressionProps[x];
        // cant just use === because values may be objects
        if (
          !isEqual(
            newState.expressions.list[i][propName],
            this.expressionList[i][propName]
          )
        ) {
          return {
            expression: newState.expressions.list[i],
            modifiedExpressionProp: propName,
            actionType: 'modify',
            oldValue: this.expressionList[i][propName],
            newValue: newState.expressions.list[i][propName],
          };
          // return false;
        }
      }
    }

    for (let i = 0; i < currentGraphProps.length; i++) {
      const propName = currentGraphProps[i];
      // ignore changes to viewport property
      if (
        propName !== 'viewport' &&
        propName !== 'squareAxes' &&
        !isEqual(newState.graph[propName], this.graph[propName])
      ) {
        return {
          modifiedGraphProp: propName,
          oldValue: this.graph[propName],
          newValue: newState.graph[propName],
        };
        // return false;
      }
    }
    // If we made it this far, objects
    // are considered equivalent
    return null;
  }

  render() {
    const { inControl, toggleControl, user } = this.props;
    const {
      showControlWarning,
      showRefWarning,
      doPreventFutureRefWarnings,
    } = this.state;
    return (
      <Fragment>
        <span id="focus" ref={this.focus} />
        <ControlWarningModal
          showControlWarning={showControlWarning}
          toggleControlWarning={() =>
            this.setState({ showControlWarning: false })
          }
          takeControl={() => {
            this.calculator.undo();
            toggleControl();
            this.setState({ showControlWarning: false });
          }}
          inControl={inControl}
          cancel={() => {
            this.calculator.undo();
            this.setState({ showControlWarning: false });
          }}
          inAdminMode={user.inAdminMode}
        />
        <CheckboxModal
          show={showRefWarning}
          infoMessage={this.refWarningMsg}
          closeModal={this.closeRefWarning}
          isChecked={doPreventFutureRefWarnings}
          checkboxDataId="ref-warning"
          onSelect={this.togglePreventRefWarning}
        />
        {!window.Desmos ? (
          <Script
            url="https://www.desmos.com/api/v1.5/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
            onLoad={this.onScriptLoad}
          />
        ) : null}
        <div
          className={classes.Graph}
          id="calculator"
          ref={this.calculatorRef}
        />
      </Fragment>
    );
  }
}

DesmosGraph.defaultProps = {
  updateUserSettings: null,
};

DesmosGraph.propTypes = {
  room: PropTypes.shape({
    tabs: PropTypes.arrayOf(PropTypes.shape({})),
    _id: PropTypes.string,
  }).isRequired,
  tab: PropTypes.shape({
    _id: PropTypes.string,
    currentState: PropTypes.string,
    desmosLink: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    inAdminMode: PropTypes.bool,
    settings: PropTypes.shape({ doShowDesmosRefWarning: PropTypes.bool }),
    _id: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  updatedRoom: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  referencing: PropTypes.bool.isRequired,
  updateUserSettings: PropTypes.func,
  addToLog: PropTypes.func.isRequired,
  emitEvent: PropTypes.func.isRequired,
};

export default DesmosGraph;
