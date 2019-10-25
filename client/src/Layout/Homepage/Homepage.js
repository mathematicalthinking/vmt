import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classes from './homepage.css';
import Button from '../../Components/UI/Button/Button';
import Background from '../../Components/Background/Background';
import Aux from '../../Components/HOC/Auxil';

class Homepage extends PureComponent {
  state = {
    error: null,
  };

  containerRef = React.createRef();

  componentDidMount() {
    const { location } = this.props;
    if (location.state && location.state.error) {
      this.setState({ error: location.state.error });
      this.timer = setTimeout(() => {
        this.setState({ error: null });
      }, 2000);
    }
    // API.get('activities').then(res => {
    //   this.setState({ popularActivities: res.data.results });
    // });
  }

  componentDidUpdate(prevProps) {
    const { rooms, history } = this.props;
    // If the user creates a temporary room // redirect them once its been created
    if (Object.keys(prevProps.rooms).length < Object.keys(rooms).length) {
      const currentRooms = Object.keys(rooms).map((id) => rooms[id]);
      const prevRooms = Object.keys(prevProps.rooms).map(
        (id) => prevProps.rooms[id]
      );
      const room = currentRooms.filter((rm) => !prevRooms.includes(rm));
      if (room[0]._id && rooms[room[0]._id].tempRoom) {
        // THIS IS HACKY
        history.push(`myVMT/explore/${room[0]._id}`);
      }
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  createRoom = () => {
    const { user, createRoom } = this.props;
    const room = {
      name: 'temp room',
      tempRoom: true,
      creator: user._id || null,
    };
    if (user._id) {
      room.members = [{ user: user._id, role: 'facilitator' }];
    }
    createRoom(room);
  };

  scrollToDomRef = () => {
    window.scroll({
      top: this.containerRef.current.offsetTop - 100,
      left: 0,
      behavior: 'smooth',
    });
  };

  render() {
    const { error } = this.state;
    return (
      <Aux>
        <Background bottomSpace={null} />
        <div className={classes.Main}>
          <section className={classes.Top}>
            {error ? <div className={classes.Error}>{error}</div> : null}
            <p className={classes.Blurb}>
              Collaborative Workspaces for Exploring the World of Math
            </p>
            <div className={classes.WorkspaceButton}>
              <Button theme="Big" click={this.createRoom} m={35}>
                Try out a Workspace
              </Button>
            </div>
          </section>
          <section>
            <p>
              VMT is currently in Alpha. If you encounter bugs or want to
              suggest new features please email vmt@21pstem.org
            </p>
            <p>last updated: 10.25.2019</p>
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
    );
  }
}

Homepage.propTypes = {
  user: PropTypes.shape({}),
  location: PropTypes.shape({}),
  history: PropTypes.shape({}).isRequired,
  createRoom: PropTypes.func.isRequired,
  rooms: PropTypes.shape({}),
};

Homepage.defaultProps = {
  user: null,
  rooms: null,
  location: null,
};

export default Homepage;
