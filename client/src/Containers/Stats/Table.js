import React from 'react';
import PropTypes from 'prop-types';
import classes from './table.css';

const Table = ({ data }) => {
  return (
    <div className={classes.Container} data-testid="table">
      <table>
        <thead>
          <tr>
            {Object.keys(data[0]).map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr
              key={d._id}
              style={{
                background: `${d.color}80`,
              }}
            >
              {Object.keys(d).map((k) => {
                return <td key={d._id + k}>{d[k]}</td>;
              })}
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
