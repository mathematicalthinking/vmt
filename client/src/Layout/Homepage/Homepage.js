import React, { PureComponent } from 'react';
// import { Link } from 'react-router-dom';
import classes from './homepage.css';
import BoxList from '../BoxList/BoxList'
import Button from '../../Components/UI/Button/Button';
import Background from '../../Components/Background/Background';
import Aux from '../../Components/HOC/Auxil';
// import bannerImage from './Picture-5.jpg';
// console.log(bannerImage)
class Homepage extends PureComponent {

  componentDidMount(){
    if (Object.keys(this.props.activities).length === 0) {
      this.props.getActivities();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rooms !== this.props.rooms) {
      const currentRooms = Object.keys(this.props.rooms).map(id => this.props.rooms[id])
      const prevRooms = Object.keys(prevProps.rooms).map(id => prevProps.rooms[id])
      let room = currentRooms.filter(room => !prevRooms.includes(room))
      this.props.history.push(`explore/${room[0]._id}`)
    }
  }

  
  createRoom = () => {
    this.props.createRoom({
      name: 'temp room',
      tempRoom: true,
    })
  }

  render() {
    const list = Object.keys(this.props.activities).map(id => this.props.activities[id]) || []
    return (
      <Aux>
        <Background/>
        <div className={classes.Main}>
          {/* <div className={classes.Parallax}>
            <div className={classes.Banner} >
              <div className={classes.GetStarted}>
                <h2>Collaborative math spaces for facilitators and participants</h2>
                <Button theme="secondary" click={this.createRoom}>Explore</Button>
              </div>
            </div>
          </div> */}
          {/* <div className={classes.Content}>
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
                <div className={classes.FDesc}>Replay activity for richer insights into participant work</div>
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
          </div> */}
        </div>

      </Aux>
    )
  }
}

export default Homepage;
