import React from 'react';
import PropTypes from 'prop-types';
import classes from './stats.css';
import Checkbox from '../../Components/Form/Checkbox/Checkbox';
import Avatar from '../../Components/UI/Avatar/Avatar';

const Filters = ({ data, filters, dispatch }) => {
  //   console.log(data.members);
  //   console.log(filters);
  return (
    <div className={classes.Container}>
      Filters
      <div className={classes.Filters}>
        <Checkbox
          dataId="byUser"
          checked={filters.byUser}
          change={() => dispatch({ type: 'TOGGLE_USER' })}
        >
          By user
        </Checkbox>
        <Checkbox
          dataId="byEvent"
          checked={filters.byEvent}
          change={() => dispatch({ type: 'TOGGLE_EVENT' })}
        >
          By event
        </Checkbox>
      </div>
      <div className={classes.SubContainer}>
        <h3>User Filters</h3>
        <div className={classes.Options}>
          {data.members.map(m => {
            const {
              color,
              user: { username, _id },
            } = m;
            return (
              <Checkbox
                dataId={_id}
                checked={filters.users.indexOf(_id) > -1}
                id={_id}
                change={() => {
                  dispatch({ type: 'ADD_REMOVE_USER', user: _id });
                }}
                key={_id}
              >
                <Avatar username={username} color={color} />
              </Checkbox>
            );
          })}
        </div>
      </div>
      <div className={classes.Options}>events</div>
    </div>
  );
};

Filters.propTypes = {
  data: PropTypes.shape({}).isRequired,
  filters: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default Filters;
