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
              suggest new features please email{' '}
              <a
                className={classes.Link}
                href="mailto:vmt@21pstem.org?subject=VMT%20Feedback%3A&body=Bug%2C%20Feature%20Request%2C%20or%20Feedback%3A%0D%0AType%20of%20activity%3A%0D%0ADescription%20or%20steps%20to%20reproduce%20issue%3A%0D%0ATime%20of%20issue%3A%0D%0AWeb%20browser%3A%0D%0AURL%20of%20area%20in%20question%3A%0D%0A"
              >
                vmt@21pstem.org
              </a>
            </p>
<<<<<<< HEAD
            <p>last updated: 2.23.2021</p>
=======
            <p>last updated: 2.22.2021</p>
>>>>>>> bbaab129e7800e5a2c2316918ef35bad3749b154
          </section>
          <section className={classes.Options} ref={this.containerRef} />
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
