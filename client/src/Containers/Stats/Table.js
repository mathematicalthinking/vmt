import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { dateFormatMap } from './stats.utils';
import './table.css';

const Table = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <td>Time</td>
          <td>Action/Message</td>
          <td>User</td>
          <td>Details</td>
          <td>xml</td>
        </tr>
      </thead>
      {data.map(d => (
        <tr key={d._id} style={{ background: d.color }}>
          <td>{moment.unix(d.timestamp / 1000).format(dateFormatMap.all)}</td>
          <td>{d.messageType ? 'message' : 'action'}</td>
          <td>{d.user ? d.user.username : 'heloo'}</td>
          <td>{d.messageType ? d.text : d.description}</td>
          <td>{d.event || d.eventArray}</td>
        </tr>
      ))}
    </table>
  );
};

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default Table;
