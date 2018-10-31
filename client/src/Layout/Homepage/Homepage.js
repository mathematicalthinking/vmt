import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import classes from './homepage.css';
import BoxList from '../BoxList/BoxList'
import Button from '../../Components/UI/Button/Button';
import Background from '../../Components/Background/Background';
import GeogebraImg from './Geogebra.png';
import DesmosImg from './desmos.jpg';
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
    console.log('creating room')
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
          <section className={classes.Top}>
            <p className={classes.Blurb}>
              Collaborative Workspaces for Exploring the World of Math 
            </p>
            <Button theme={'Big'} click={this.createRoom} m={35}>Try out a Workspace</Button>
          </section>
          <i className={["fas fa-chevron-down", classes.Down].join(" ")}></i>
          <section className={classes.Options}>
            <div className={classes.Geogebra}>
              <img className={classes.GgbImage} src={GeogebraImg} alt='geogebra' />
              <div>
                <p className={classes.LongerBlurb}>GeoGebra is dynamic mathematics software for all levels of education that 
                  brings together geometry, algebra, spreadsheets, graphing, statistics and 
                  calculus in one easy-to-use package. GeoGebra is a rapidly expanding 
                  community of millions of users located in just about every country.
                </p>
                <Link to='https://www.geogebra.org'>Learn More</Link>
              </div>
            </div>
            <div className={classes.Desmos}>
              <img className={classes.DesmosImage} src={DesmosImg} alt='desmos' />
              <p className={classes.LongerBlurb}>
                Desmos is a free graphing calculator with a large community of teachers and students actively 
                building and sharing activities. 
              </p>
            </div>
          </section>
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
