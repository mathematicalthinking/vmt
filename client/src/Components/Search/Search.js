import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './search.css';

class Search extends Component {
  constructor(props) {
    super(props);
    this.searchRef = React.createRef();
  }
  componentDidMount() {
    this.searchRef.current.focus();
  }
  render() {
    const { theme, placeholder, _search } = this.props;
    return (
      <div className={[classes.Search].join(' ')}>
        <input
          ref={this.searchRef}
          // eslint-disable-next-line react/destructuring-assignment
          data-testid={this.props['data-testid']}
          className={[classes.Input, classes[theme]].join(' ')}
          type="text"
          placeholder={placeholder}
          onChange={event => _search(event.target.value.trim())}
        />
        <i className={['fas fa-search', classes.Icon].join(' ')} />
      </div>
    );
  }
}

Search.propTypes = {
  theme: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  _search: PropTypes.func.isRequired,
  'data-testid': PropTypes.string.isRequired,
};

export default Search;
