import React from 'react';
import { Link } from 'react-router-dom';
import classes from './homepage.css';
import BoxList from '../BoxList/BoxList'
import HomeNav from '../../Components/Navigation/HomeNav/HomeNav';
import Button from '../../Components/UI/Button/Button';
// import bannerImage from './Picture-5.jpg';
// console.log(bannerImage)
const Homepage = () => {
  return (
    <div>
      <HomeNav />
      <div className={classes.Main}>
        <div className={classes.Parallax}>
          <div className={classes.Banner} >
            <div className={classes.GetStarted}>
              <h2>Collaborative math spaces for teachers and students</h2>
              <Button theme="secondary"><Link to='/workspace/explore'>Explore</Link></Button>
            </div>
          </div>
        </div>
        <div className={classes.Content}>
          <div className={classes.Features}>
            <div className={classes.Feature}>
              <div className={classes.FTitle}>Collaborate</div>
              <div className={classes.FIcon}>
                <i class="fas fa-user-friends"></i>
              </div>
              <div className={classes.FDesc}>Solve math problems in groups from anywhere in the world</div>
            </div>
            <div className={classes.Feature}>
              <div className={classes.FTitle}>Analyze</div>
              <div className={classes.FIcon}>
                <i class="fas fa-chart-pie"></i>
              </div>
              <div className={classes.FDesc}>Replay activity for richer insights into student work</div>
            </div>
            <div className={classes.Feature}>
              <div className={classes.FTitle}>Share</div>
              <div className={classes.FIcon}>
                <i class="fas fa-share"></i>
              </div>
              <div className={classes.FDesc}>Get Access to trillions of activities</div>
            </div>
          </div>
          <div className={classes.Examples}>
            <h2>Top Activities</h2>
            <BoxList list={[{name: "example1", isPublic: true}]}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Homepage;
