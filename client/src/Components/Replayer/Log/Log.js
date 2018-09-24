import React, { PureComponent } from 'react';
import classes from './Log.Styles.css';
class Log extends PureComponent {

  componentDidMount() {

  }

  componentDidUpdate(prevProps) {

  }

  render() {
    console.log(this.props.log)
    return (
      <div className={classes.Log}>
        {
          this.props.log.map((event, i) => {
            console.log("EVENT: ", event._id)
            if (event._id) {
              return <div style={{color: 'red'}} key={i}>{event._id}</div>
            }
          })
        }
      </div>
    )
  }
}

export default Log;
