import React from 'react';
import PropTypes from 'prop-types';
import classes from './stats.css';
import Checkbox from '../../Components/Form/Checkbox/Checkbox';
import Timeline from '../../Components/Timeline/Timeline';
import Avatar from '../../Components/UI/Avatar/Avatar';
import { lineColors } from './stats.utils';

const messageFilters = [
  {
    dataId: 'User messages',
    payload: 'USER',
    filterType: 'messages',
  },
  {
    dataId: 'Enter/exit messages',
    payload: 'ENTER_EXIT',
    filterType: 'messages',
  },
  {
    dataId: 'Control',
    payload: 'CONTROL',
    filterType: 'messages',
  },
];

const actionFilters = [
  {
    dataId: 'Add',
    payload: 'ADD',
    filterType: 'actions',
  },
  {
    dataId: 'Remove',
    payload: 'REMOVE',
    filterType: 'actions',
  },
  {
    dataId: 'Drag',
    payload: 'BATCH_UPDATE',
    filterType: 'actions',
  },
  {
    dataId: 'Update',
    payload: 'UPDATE',
    filterType: 'actions',
  },
  {
    dataId: 'Select',
    payload: 'SELECT',
    filterType: 'actions',
  },
];

const Filters = ({ data, filters, dispatch }) => {
  const {
    users,
    events,
    messages,
    actions,
    startDateF,
    endDateF,
    startTime,
    endTime,
    durationDisplay,
    currentStartTime,
    currentEndTime,
  } = filters;
  const { members } = data;

  const areMessages = events.indexOf('MESSAGES') > -1;
  const areActions = events.indexOf('ACTIONS') > -1;
  return (
    <div className={classes.Container}>
      <div className={classes.Filter}>
        <h3>Time</h3>
        <div className={classes.Options}>
          <Timeline
            dispatch={dispatch}
            startTime={startTime}
            endTime={endTime}
            currentStartTime={currentStartTime}
            currentEndTime={currentEndTime}
            startDateF={startDateF}
            endDateF={endDateF}
            durationDisplay={durationDisplay}
          />
        </div>
      </div>
      <div className={classes.Filter}>
        <h3>Users</h3>
        <div className={classes.Options}>
          <div className={classes.Checkbox}>
            <Checkbox
              dataId="all_users"
              checked={filters.users.length === 0}
              change={() => {
                dispatch({
                  type: 'ADD_REMOVE_FILTER',
                  filterType: 'users',
                  payload: 'ALL',
                });
              }}
            >
              All
            </Checkbox>
          </div>
          {members.map(m => {
            const {
              color,
              user: { username, _id },
            } = m;
            return (
              <div className={classes.Checkbox} key={_id}>
                <Checkbox
                  dataId={_id}
                  checked={users.indexOf(_id) > -1}
                  id={_id}
                  change={() => {
                    dispatch({
                      type: 'ADD_REMOVE_FILTER',
                      filterType: 'users',
                      payload: _id,
                    });
                  }}
                >
                  <Avatar username={username} color={color} />
                </Checkbox>
              </div>
            );
          })}
        </div>
      </div>
      <div className={classes.Filter}>
        <h3>Events</h3>
        <div className={classes.Col}>
          <div className={classes.ColCheckbox}>
            <Checkbox
              dataId="all_events"
              checked={filters.events.length === 0}
              id="all_events"
              change={() => {
                dispatch({
                  type: 'ADD_REMOVE_FILTER',
                  filterType: 'events',
                  payload: 'ALL',
                });
              }}
            >
              All
            </Checkbox>
          </div>
          <div
            className={classes.ColCheckbox}
            style={
              areMessages && messages.length === 0 && users.length < 2
                ? {
                    background: lineColors.MESSAGES,
                    color: 'white',
                  }
                : null
            }
          >
            <Checkbox
              dataId="messages"
              checked={areMessages}
              change={() => {
                dispatch({
                  type: 'ADD_REMOVE_FILTER',
                  filterType: 'events',
                  payload: 'MESSAGES',
                });
              }}
            >
              Messages
            </Checkbox>
          </div>
          {areMessages ? (
            <div className={classes.IndentedRow}>
              {messageFilters.map(mf => {
                return (
                  <div
                    key={mf.dataId}
                    className={classes.Checkbox}
                    style={
                      messages.indexOf(mf.payload) > -1 && users.length < 2
                        ? { background: lineColors[mf.payload], color: 'white' }
                        : null
                    }
                  >
                    <Checkbox
                      dataId={mf.dataId}
                      checked={filters[mf.filterType].indexOf(mf.payload) > -1}
                      change={() => {
                        dispatch({
                          type: 'ADD_REMOVE_FILTER',
                          payload: mf.payload,
                          filterType: mf.filterType,
                        });
                      }}
                    >
                      {mf.dataId}
                    </Checkbox>
                  </div>
                );
              })}
            </div>
          ) : null}
          <div
            className={classes.ColCheckbox}
            style={
              areActions && users.length < 2 && actions.length === 0
                ? { background: lineColors.ACTIONS, color: 'white' }
                : null
            }
          >
            <Checkbox
              dataId="actions"
              checked={areActions}
              change={() => {
                dispatch({
                  type: 'ADD_REMOVE_FILTER',
                  filterType: 'events',
                  payload: 'ACTIONS',
                });
              }}
            >
              Actions
            </Checkbox>
          </div>
          {areActions ? (
            <div className={classes.IndentedRow}>
              {actionFilters.map(af => {
                return (
                  <div
                    key={af.dataId}
                    className={classes.Checkbox}
                    style={
                      actions.indexOf(af.payload) > -1 && users.length < 2
                        ? { background: lineColors[af.payload], color: 'white' }
                        : null
                    }
                  >
                    <Checkbox
                      dataId={af.dataId}
                      checked={filters[af.filterType].indexOf(af.payload) > -1}
                      change={() => {
                        dispatch({
                          type: 'ADD_REMOVE_FILTER',
                          payload: af.payload,
                          filterType: af.filterType,
                        });
                      }}
                    >
                      {af.dataId}
                    </Checkbox>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

Filters.propTypes = {
  data: PropTypes.shape({}).isRequired,
  filters: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Filters;
