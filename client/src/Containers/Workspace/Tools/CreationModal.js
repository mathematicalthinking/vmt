import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { hri } from 'human-readable-ids';
import { createActivity, createRoom } from '../../../store/actions';
import {
  Modal,
  Button,
  SelectionList,
  TextInput,
  // RadioBtn,
} from '../../../Components';
import modalClasses from '../../../Components/UI/Modal/modal.css';
// import createClasses from '../../Create/create.css';
import formatImageUrl from '../../Create/tinyGraphs.utils';

const CreationModal = (props) => {
  const { populatedRoom, user, history, mathState, currentTabId } = props;

  const [newName, setNewName] = useState('');
  const [newResourceType] = useState('activity');
  const [selectedTabIdsToCopy, setSelectedIdsToCopy] = useState([currentTabId]);
  const [createActivityError, setCreateActivityError] = useState(`${' '}`);
  const [isCreatingActivity, setIsCreatingActivity] = useState(true);

  useEffect(() => {
    _updateError();
  }, [newResourceType, selectedTabIdsToCopy, newName]);

  const createNewActivityOrRoom = () => {
    const copy = { ...populatedRoom };
    const { connectCreateActivity, connectCreateRoom } = props;

    _updateError();
    if (createActivityError) return;

    const { description, privacySetting, instructions } = copy;
    const pluralResource =
      newResourceType === 'activity' ? 'activities' : 'rooms';
    const resourceBody = {
      creator: user._id,
      name: newName,
      selectedTabIds: selectedTabIdsToCopy,
      description,
      privacySetting,
      instructions,
      sourceRooms: [populatedRoom._id],
      mathState,
      image: formatImageUrl(newName, pluralResource),
    };

    if (privacySetting === 'private') {
      resourceBody.entryCode = hri.random();
    }
    let updateFn;
    let myVMTEndPt;

    if (newResourceType === 'activity') {
      updateFn = connectCreateActivity;
      myVMTEndPt = 'activities';
    } else {
      updateFn = connectCreateRoom;
      myVMTEndPt = 'rooms';

      resourceBody.members = [
        {
          user: { username: user.username, _id: user._id },
          role: 'facilitator',
        },
      ];
    }
    updateFn(resourceBody);
    setIsCreatingActivity(false);
    history.push(`/myVMT/${myVMTEndPt}`);
  };

  const _updateError = () => {
    const newResource =
      newResourceType === 'activity' ? 'template' : newResourceType;
    const isSingleTab = populatedRoom.tabs.length === 1;
    if (createActivityError) {
      if (isSingleTab && newName) setCreateActivityError(``);
      else if (selectedTabIdsToCopy.length > 0 && newName) {
        setCreateActivityError(``);
      }
    }
    if (!selectedTabIdsToCopy.length > 0 && !isSingleTab) {
      setCreateActivityError('Please select at least one tab to include');
    }

    if (!newName) {
      setCreateActivityError(
        `Please provide a name for your new ${newResource ||
          'resource and select type above'}`
      );
    }
  };

  //   createNewActivity = () => {
  //     const { activity } = this.props;
  //     const copy = { ...activity };
  //     const { user, connectCreateActivity, history } = this.props;
  //     const { newName, selectedTabIdsToCopy } = this.state;

  //     if (!selectedTabIdsToCopy.length > 0) {
  //       this.setState({
  //         copyActivityError: 'Please select at least one tab to copy',
  //       });
  //       return;
  //     }

  //     if (!newName) {
  //       this.setState({
  //         copyActivityError: 'Please provide a name for your new activity',
  //       });
  //       return;
  //     }
  //     copy.activities = [copy._id];
  //     delete copy._id;
  //     delete copy.createdAt;
  //     delete copy.updatedAt;
  //     delete copy.course;
  //     delete copy.courses;
  //     copy.creator = user._id;
  //     copy.name = newName;
  //     copy.tabs = copy.tabs.map((tab) => tab._id);
  //     copy.selectedTabIds = selectedTabIdsToCopy;
  //     connectCreateActivity(copy);
  //     this.setState({ addingToMyActivities: false, selectedTabIdsToCopy: [] });
  //     history.push('/myVMT/activities');
  //   };

  const addTabIdToCopy = (event, id) => {
    if (selectedTabIdsToCopy.indexOf(id) === -1) {
      setSelectedIdsToCopy([...selectedTabIdsToCopy, id]);
    } else {
      setSelectedIdsToCopy(
        selectedTabIdsToCopy.filter((tabId) => tabId !== id)
      );
    }
  };

  const { closeModal, currentTabs } = props;
  return (
    <Modal show={isCreatingActivity} closeModal={closeModal}>
      <p style={{ marginBottom: 10 }}>
        Create a new Template based on this room
      </p>
      {/* <div className={createClasses.RadioButtons}>
        <RadioBtn
          name="activity"
          checked={newResourceType === 'activity'}
          check={() => {
            setNewResourceType('activity');
          }}
        >
          Template
        </RadioBtn>
        <RadioBtn
          name="room"
          checked={newResourceType === 'room'}
          check={() => {
            setNewResourceType('room');
          }}
        >
          Room
        </RadioBtn>
      </div> */}
      <TextInput
        show={isCreatingActivity}
        light
        focus={isCreatingActivity}
        name="new name"
        value={newName}
        change={(event) => {
          setNewName(event.target.value);
          _updateError();
        }}
        label={`New ${newResourceType === 'room' ? 'room' : 'template'} Name`}
      />
      {currentTabs && currentTabs.length > 1 ? (
        <div className={modalClasses.FormSection}>
          <SelectionList
            listToSelectFrom={currentTabs}
            selectItem={addTabIdToCopy}
            selected={selectedTabIdsToCopy}
          />
        </div>
      ) : null}
      {createActivityError ? (
        <div className={modalClasses.Error}>{createActivityError}</div>
      ) : null}

      <Button
        data-testid={`create-new-${newResourceType}`}
        click={createNewActivityOrRoom}
      >
        Create {newResourceType === 'room' ? 'room' : 'template'}
      </Button>
    </Modal>
  );
};

CreationModal.propTypes = {
  connectCreateActivity: PropTypes.func.isRequired,
  connectCreateRoom: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  history: PropTypes.shape({}).isRequired,
  populatedRoom: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  currentTabs: PropTypes.arrayOf(PropTypes.shape({})),
  mathState: PropTypes.shape({}),
  currentTabId: PropTypes.string.isRequired,
};

CreationModal.defaultProps = {
  currentTabs: {},
  mathState: {},
};

const mapStateToProps = (state) => {
  return {
    userId: state.user._id,
    user: state.user,
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    {
      connectCreateActivity: createActivity,
      connectCreateRoom: createRoom,
    }
  )(CreationModal)
);
