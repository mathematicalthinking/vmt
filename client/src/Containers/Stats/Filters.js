import React from 'react';
import PropTypes from 'prop-types';
import classes from './stats.css';
import Checkbox from '../../Components/Form/Checkbox/Checkbox';
import Avatar from '../../Components/UI/Avatar/Avatar';
import { lineColors } from './processData';

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
    payload: 'DRAG',
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
  //   console.log(data.members);
  //   console.log(filters);
  const { users, events, messages } = filters;
  const areMessages = events.indexOf('MESSAGES') > -1;
  const areActions = events.indexOf('ACTIONS') > -1;
  return (
    <div>
      <div className={classes.row}>
        <h3>Users</h3>
        <div className={classes.Options}>
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
          {data.members.map(m => {
            const {
              color,
              user: { username, _id },
            } = m;
            return (
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
                key={_id}
              >
                <Avatar username={username} color={color} />
              </Checkbox>
            );
          })}
        </div>
      </div>
      <div className={classes.row}>
        <h3>Events</h3>
        <div>
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
            style={
              areMessages
                ? {
                    color:
                      messages.length === 0 && users.length < 2
                        ? lineColors.MESSAGES
                        : 'inherit',
                  }
                : null
            }
          >
            Messages
          </Checkbox>
          {areMessages ? (
            <div className={classes.IndentedRow}>
              {messageFilters.map(mf => {
                return (
                  <Checkbox
                    key={mf.dataId}
                    dataId={mf.dataId}
                    checked={filters[mf.filterType].indexOf(mf.payload) > -1}
                    change={() => {
                      dispatch({
                        type: 'ADD_REMOVE_FILTER',
                        payload: mf.payload,
                        filterType: mf.filterType,
                      });
                    }}
                    style={
                      messages.indexOf(mf.payload) > -1 && users.length < 2
                        ? { color: lineColors[mf.payload] }
                        : null
                    }
                  >
                    {mf.dataId}
                  </Checkbox>
                );
              })}
            </div>
          ) : null}
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
            style={
              areActions && users.length < 2
                ? { color: lineColors.ACTIONS }
                : null
            }
          >
            Actions
          </Checkbox>
          {areActions ? (
            <div className={classes.IndentedRow}>
              {actionFilters.map(af => {
                return (
                  <Checkbox
                    key={af.dataId}
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
