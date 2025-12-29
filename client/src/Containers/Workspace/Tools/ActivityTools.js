import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { TextInput, Button } from 'Components';
import { TabTypes } from 'Model';
import { getDesmosActivityUrl } from 'utils';
import classes from './tools.css';

const ActivityTools = (props) => {
  const { owner, copy, goBack, tabs, currentTab, onSave } = props;
  const [link, setLink] = useState(currentTab.desmosLink);
  const [isChanged, setIsChanged] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const savedLink = useRef(currentTab.desmosLink);

  useEffect(() => {
    setLink(currentTab.desmosLink);
    setIsChanged(false);
    setIsSaved(false);
    savedLink.current = currentTab.desmosLink;
  }, [currentTab._id]);

  const tabdata = tabs.map((tab) => {
    if (tab.tabType === 'desmosActivity' && tab.desmosLink) {
      // Desmos Base URL: https://teacher.desmos.com/activitybuilder/custom/
      return (
        <div>
          {tab.name}:{' '}
          <a
            className={classes.Link}
            target="_blank"
            rel="noopener noreferrer"
            href={getDesmosActivityUrl(tab.desmosLink)}
            data-testid="desmos-link"
          >
            Base configuration at Teacher.Desmos
          </a>
        </div>
      );
    }
    return null;
  });

  const _handleChange = (event) => {
    setLink(event.target.value);
    setIsChanged(true);
  };
  const _handleSave = () => {
    savedLink.current = currentTab.desmosLink;
    onSave(link);
    setIsChanged(false);
    setIsSaved(true);
  };
  const _handleCancel = () => {
    setLink(currentTab.desmosLink);
    setIsChanged(false);
    setIsSaved(false);
  };

  const _handleUndo = () => {
    onSave(savedLink.current);
    setLink(savedLink.current);
    setIsChanged(false);
    setIsSaved(false);
  };

  return (
    <div className={classes.Container}>
      <h3 className={classes.Title}>Tools</h3>
      <div className={classes.Expanded} data-testid="current-members">
        {owner ? (
          <div>
            <p data-testid="owner-msg">
              As the owner of this template you can make changes to initial
              construction.
            </p>
            <br />
            <p>
              Once you are ready to collaborate on this template you can click
              &quot;Exit Template&quot; and then select &quot;Assign
              Template&quot;. You can then decide who you want to collaborate
              with.
            </p>
            <br />
            <p>
              When you click &quot;Assign&quot; this template will be copied to
              a room where you can begin collaborating.
            </p>
            <p>
              For more information click{' '}
              <Link
                className={classes.Link}
                to="/instructions"
                data-testid="about-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </Link>
              {'. '}
            </p>
            <br />
            {tabdata}
            <br />
            Desmos Activity editing is in draft within VMT. Find more at{' '}
            <a
              className={classes.Link}
              target="_blank"
              rel="noopener noreferrer"
              href="https://teacher.desmos.com/"
              data-testid="desmos-link"
            >
              teacher.desmos.com
            </a>
            <div className={classes.Save}>
              <div
                className={classes.SideButton}
                role="button"
                tabIndex="-3"
                onKeyPress={copy}
                onClick={copy}
                data-testid="copy-template"
              >
                copy this template
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p>
              If you want to make changes to this template, copy it to your list
              of activity templates first.
            </p>
            <br />
            <p>
              After you copy it you can create your own rooms from this template
              and invite others to collaborate with you.
            </p>
            <div className={classes.Save}>
              <div
                className={classes.SideButton}
                role="button"
                tabIndex="-3"
                onKeyDown={copy}
                onClick={copy}
                data-testid="copy-activity"
              >
                copy this template
              </div>
            </div>
          </div>
        )}
        {TabTypes.hasInitializer(currentTab.tabType) && (
          <div>
            <TextInput
              type="textarea"
              light
              value={link}
              change={_handleChange}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}
            >
              {' '}
              <Button disabled={!isChanged} click={_handleSave}>
                Save
              </Button>
              <Button
                disabled={!isChanged}
                theme="Cancel"
                click={_handleCancel}
              >
                Cancel
              </Button>
              {isSaved && <Button click={_handleUndo}>Undo</Button>}
            </div>
          </div>
        )}
        <div className={classes.Controls}>
          <div
            className={[classes.SideButton, classes.Exit].join(' ')}
            role="button"
            tabIndex="-4"
            onClick={goBack}
            onKeyDown={goBack}
            theme="Small"
            data-testid="exit-room"
          >
            Exit Template
          </div>
        </div>
      </div>
    </div>
  );
};

ActivityTools.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  owner: PropTypes.bool.isRequired,
  // save: PropTypes.func,
  copy: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  currentTab: PropTypes.shape({
    tabType: PropTypes.string,
    _id: PropTypes.string,
    desmosLink: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ActivityTools;
