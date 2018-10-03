import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import randomString from 'crypto-random-string';
import classes from './homepage.css';
import BoxList from '../BoxList/BoxList'
import Button from '../../Components/UI/Button/Button';
// import bannerImage from './Picture-5.jpg';
// console.log(bannerImage)
class Homepage extends PureComponent {

  componentDidMount(){
    if (Object.keys(this.props.activities).length === 0) {
      this.props.getActivities();
    }
  }
  render() {
    const randomId = randomString(10);
    const list = Object.keys(this.props.activities).map(id => this.props.activities[id]) || []
    return (
      <div>
        <div className={classes.Main}>
          <div className={classes.Parallax}>
            <div className={classes.Banner} >
              <div className={classes.GetStarted}>
                <h2>Collaborative math spaces for teachers and students</h2>
                <Button theme="secondary"><Link to={`/explore/${randomId}`}>Explore</Link></Button>
              </div>
            </div>
          </div>
          <div className={classes.Content}>
            <div className={classes.Features}>
              <div className={classes.Feature}>
                <div className={classes.FTitle}>Collaborate</div>
                <div className={classes.FIcon}>
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className={classes.FDesc}>Solve math problems in groups from anywhere in the world</div>
              </div>
              <div className={classes.Feature}>
                <div className={classes.FTitle}>Analyze</div>
                <div className={classes.FIcon}>
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div className={classes.FDesc}>Replay activity for richer insights into student work</div>
              </div>
              <div className={classes.Feature}>
                <div className={classes.FTitle}>Share</div>
                <div className={classes.FIcon}>
                  <i className="fas fa-share"></i>
                </div>
                <div className={classes.FDesc}>Get Access to trillions of activities</div>
              </div>
            </div>
            <div className={classes.Examples}>
              <h2>Top Activities</h2>
              <BoxList list={list}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Homepage;
