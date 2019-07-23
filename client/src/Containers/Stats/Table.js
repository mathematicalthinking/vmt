import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { dateFormatMap } from './stats.utils';
import classes from './table.css';

const Table = ({ data }) => {
  return (
    <div className={classes.Container}>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Action/Message</th>
            <th>User</th>
            <th>Details</th>
            <th>xml</th>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d._id} style={{ background: d.color }}>
              <td>
                {moment.unix(d.timestamp / 1000).format(dateFormatMap.all)}
              </td>
              <td>{d.messageType ? 'message' : 'action'}</td>
              <td>{d.user ? d.user.username : 'heloo'}</td>
              <td>{d.messageType ? d.text : d.description}</td>
              <td>{d.event || d.eventArray}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default Table;
