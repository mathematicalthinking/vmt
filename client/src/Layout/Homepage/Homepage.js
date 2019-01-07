import React, { PureComponent } from 'react';
// import { Link } from 'react-router-dom';
import classes from './homepage.css';
// import BoxList from '../BoxList/BoxList'
// import Button from '../../Components/UI/Button/Button';
import Background from '../../Components/Background/Background';
// import GeogebraImg from './Geogebra.png';
// import DesmosImg from './desmos.jpg';
import API from '../../utils/apiRequests';
import Aux from '../../Components/HOC/Auxil';

class Homepage extends PureComponent {

  state = {
    popularActivities: [],
    error: null,
  }

  containerRef = React.createRef()
  componentDidMount(){
    if (this.props.location.state && this.props.location.state.error) {
      console.log('error: ', this.props.location.state.error)
      this.setState({error: this.props.location.state.error})
      this.timer = setTimeout(() => {console.log("clearing error: "); this.setState({error: null})} , 2000)
    }
    API.get('activities')
    .then(res => {
      this.setState({popularActivities: res.data.results})
    })
  }

  componentDidUpdate(prevProps) {
    // If the user creates a temporary room // redirect them once its been created
    if (Object.keys(prevProps.rooms).length < Object.keys(this.props.rooms).length) {
      const currentRooms = Object.keys(this.props.rooms).map(id => this.props.rooms[id])
      const prevRooms = Object.keys(prevProps.rooms).map(id => prevProps.rooms[id])
      let room = currentRooms.filter(room => !prevRooms.includes(room))
      if (room[0]._id && this.props.rooms[room[0]._id].tempRoom) { // THIS IS HACKY
        this.props.history.push(`explore/${room[0]._id}`)
      }
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  createRoom = () => {
    let room = {
      name: 'temp room',
      tempRoom: true,
      creator: this.props.user._id || null,
    }
    if (this.props.user._id) {
      room.members = [{user: this.props.user._id, role: 'facilitator'}]
    }
    this.props.createRoom(room)
  }

  scrollToDomRef = () => {
    window.scroll({top: this.containerRef.current.offsetTop - 100, left: 0, behavior: 'smooth'})
  }

  render() {
    return (
      <Aux>
        <Background bottomSpace={window.screen.availHeight < 1000 ? -10 : null}/>
        {/* <div className={classes.BackgroundExtension}></div>
        <div className={classes.Ex2}></div>
        <div className={classes.Ex3}></div>
        <div className={classes.Ex4}></div>
        <div className={classes.Ex5}></div>
        <div className={classes.Ex6}></div> */}
        <div className={classes.Main}>
          <section className={classes.Top}>
            {this.state.error ? <div className={classes.Error}>{this.state.error}</div> : null}
            <p className={classes.Blurb}>
              Collaborative Workspaces for Exploring the World of Math
            </p>
            {/* <Button theme={'Big'} click={this.createRoom} m={35}>Try out a Workspace</Button> */}
          </section>
          {/* <i onClick={this.scrollToDomRef} className={["fas fa-chevron-down", classes.Down].join(" ")}></i> */}
          <section className={classes.Options} ref={this.containerRef}>
            {/* <h3 className={classes.Subtitle}>Popular Activities</h3>
            <BoxList list={this.state.popularActivities}/> */}
            {/* <div className={classes.Geogebra}>
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
            </div> */}
          </section>
        </div>
      </Aux>
    )
  }
}

export default Homepage;
