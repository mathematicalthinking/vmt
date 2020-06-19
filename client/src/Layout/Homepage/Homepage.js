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
              suggest new features please email vmt@21pstem.org
            </p>
            <p>last updated: 06.19.2020</p>
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
