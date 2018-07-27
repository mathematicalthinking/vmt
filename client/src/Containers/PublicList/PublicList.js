import React, { Component } from 'react';
import BoxList from '../../Layout/BoxList/BoxList';
import Search from '../../Components/Search/Search';
import classes from './publicList.css';
import API from '../../utils/apiRequests';
// import { connect } from 'react-redux';
let allResources = [];
class PublicList extends Component {
  state = {
    resources: [],
  }
  componentDidMount() {
    API.get(this.props.resource)
    .then(res => {
      allResources = res.data.results
      this.setState({resources: allResources})
    })
  }

  filterResults = value => {
    value = value.toLowerCase();
    const updatedResources = allResources.filter(resource => {
      return (
        resource.name.toLowerCase().includes(value) ||
        resource.description.toLowerCase().includes(value) ||
        resource.creator.toLowerCase().includes(value)
      )
    })
    this.setState({resources: updatedResources})
  }
  render () {
    console.log(this.state.resources)
    return (
      <div>
        <h2>{this.props.resource + 's'}</h2>
        <Search filter={value => this.filterResults(value)} />
        <div className={classes.Seperator}></div>
        <BoxList list={this.state.resources} resource={this.props.resource}/>
      </div>
    )
  }
}

export default PublicList;
