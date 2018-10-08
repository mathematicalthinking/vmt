import React, { PureComponent } from 'react';
import BoxList from '../BoxList/BoxList';
import Search from '../../Components/Search/Search'
import classes from './community.css';
class Community extends PureComponent {
    render() {
      console.log("COMMUNITY PROPS: ", this.props)
      return (
        <div>
          <div>
            HELLO
          </div>
        <h2>{this.props.match.params.resource}</h2>
        <Search _filter={value => this.filterResults(value)} />
        <div className={classes.Seperator}></div>
        {/* @ TODO Eventually remove dashboard...we want to have a public facing view
        that does not show up in  the dashboard. */}
        <BoxList
          list={this.props.visibleResources}
          resource={this.props.match.params.resource}
          // linkPath={linkPath}
          // linkSuffix={linkSuffix}
        />
      </div>
      )
    }
}

export default Community;