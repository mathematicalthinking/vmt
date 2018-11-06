import React, { PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import HomeNav from '../Components/Navigation/HomeNav/HomeNav';
import { Homepage, Login, Signup, TempWorkspace, Community } from '../Containers';
import classes from './main.css'
import Aux from '../Components/HOC/Auxil';
class Home extends PureComponent {

  state = {
    scrollPosition: 0
  }

  componentDidMount(){
    window.addEventListener('scroll', this.handleScroll)
  }

  handleScroll = event => {
    console.log('handling scroll')
    // console.log('handling croll')
    // // console.log(event)
    // console.log(event.srcElement.scrollingElement.scrollTop)
    // // console.log(window)
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
          <Route path='/login' component={Login} />
          <Route path='/signup' component={Signup} />
          <Route path='/explore/:id' component={TempWorkspace} />
        </Switch>
        </div>
        {/* <Route path='/about' component={About} />
        <Route path='/tutorials' component={Tutorials} /> */}

      </Aux>

    )
  }
}

export default Home;
