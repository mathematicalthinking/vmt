import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import HomeNav from './Components/Navigation/HomeNav/HomeNav';
import { Homepage, Login } from './Containers';
import Aux from './Components/HOC/Auxil';
class Home extends PureComponent {
  render () {
    return (
      <Aux>
        <HomeNav />
        <Route path='/' component={Homepage} />
      </Aux>

    )
  }
}

export default Home;
