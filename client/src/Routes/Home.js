import React, { PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import HomeNav from '../Components/Navigation/HomeNav/HomeNav';
import { Homepage, Login, Signup, TempWorkspace, Community, Logout, } from '../Containers';
import { Confirmation } from '../Layout';
import classes from './main.css'
import Aux from '../Components/HOC/Auxil';
class Home extends PureComponent {

  state = {
    scrollPosition: 0
  }

  componentDidMount(){
    window.addEventListener('scroll', this.handleScroll)  // @TODO while it would be less dry we should move this out of here and into homeNave and Homepage...
    // having this at the top level causes a complete re-render of the app on every scroll...actually we might just need it on the homeNav
  }

  componentWillUnmount(){
    window.removeEventListener('scroll', this.handleScroll) 
  }

  handleScroll = event => {
    this.setState({scrollPosition: event.srcElement.scrollingElement.scrollTop/window.innerHeight})
  }

  render () {
    return (
      <Aux>
        <HomeNav scrollPosition={this.state.scrollPosition} page={this.props.location.pathname}/>
        <div className={classes.Container}>
        <Switch>
          <Route exact path='/' render={() => <Homepage scrollPosition={this.state.scrollPosition} {...this.props}/>} />
          <Route path='/community/:resource/:action' component={Community} />
          <Route path='/community/:resource' component={Community} />
          <Route exact path={`/logout`} component={Logout}/>
          <Route path='/login' component={Login} />
          <Route path='/signup' component={Signup} />
          <Route path='/explore/:id' component={TempWorkspace} />
          <Route path='/confirmation' component={Confirmation} />
        </Switch>
        </div>
        {/* <Route path='/about' component={About} />
        <Route path='/tutorials' component={Tutorials} /> */}

      </Aux>

    )
  }
}

export default Home;
