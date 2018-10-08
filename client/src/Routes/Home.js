import React, { PureComponent } from 'react';
import { Route, Switch } from 'react-router-dom';
import HomeNav from '../Components/Navigation/HomeNav/HomeNav';
import { Homepage, Login, Signup, TempWorkspace, Community } from '../Containers';
import Aux from '../Components/HOC/Auxil';
class Home extends PureComponent {
  render () {
    return (
      <Aux>
        <HomeNav />
        <Switch>
          <Route exact path='/' component={Homepage} />
          <Route path='/community/:resource' component={Community} />
          <Route path='/login' component={Login} />
          <Route path='/signup' component={Signup} />
          <Route path='/explore/:id' component={TempWorkspace} />
        </Switch>
        {/* <Route path='/about' component={About} />
        <Route path='/tutorials' component={Tutorials} /> */}

      </Aux>

    )
  }
}

export default Home;
