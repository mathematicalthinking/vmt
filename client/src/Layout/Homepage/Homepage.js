import React from 'react';
import classes from './homepage.css';
import HomeNav from '../../Components/Navigation/HomeNav/HomeNav';
// import bannerImage from './Picture-5.jpg';
// console.log(bannerImage)
const Homepage = () => {
  return (
    <div>
      <HomeNav />
      <div className={classes.Banner} >
        <div className={classes.GetStarted}>
          <h2>Collaborative math spaces for teachers and students</h2>
        </div>
      </div>
      <div className={classes.Features}>
        <div className={classes.Particles} id='particles-js'></div>

      </div>
      <div className={classes.Examples}>

      </div>
    </div>
  )
}

export default Homepage;
