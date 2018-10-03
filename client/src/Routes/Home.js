import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import HomeNav from '../Components/Navigation/HomeNav/HomeNav';
import { Homepage, Login, Signup, Workspace } from '../Containers';
import Aux from '../Components/HOC/Auxil';
class Home extends PureComponent {
  render () {
    return (
      <Aux>
        <HomeNav />
        <Route exact path='/' component={Homepage} />
        <Route path='/login' component={Login} />
        <Route path='/signup' component={Signup} />
        <Route path='/explore' component={Workspace} />
        {/* <Route path='/about' component={About} />
        <Route path='/tutorials' component={Tutorials} /> */}

      </Aux>

    )
  }
}

export default Home;
