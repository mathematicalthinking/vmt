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
    const {
      theme,
      placeholder,
      _search,
      value,
      isControlled,
      'data-testid': dataTestId,
    } = this.props;
    return (
      <div className={[classes.Search].join(' ')}>
        {isControlled ? ( // if value this will be controlled else it won't
          <input
            value={value}
            ref={this.searchRef}
            data-testid={dataTestId}
            className={[classes.Input, classes[theme]].join(' ')}
            type="text"
            placeholder={placeholder}
            onChange={(event) => _search(event.target.value)}
          />
        ) : (
          <input
            ref={this.searchRef}
            data-testid={dataTestId}
            className={[classes.Input, classes[theme]].join(' ')}
            type="text"
            placeholder={placeholder}
            onChange={(event) => _search(event.target.value)}
          />
        )}
        <i className={['fas fa-search', classes.Icon].join(' ')} />
      </div>
    );
  }
}

Search.propTypes = {
  theme: PropTypes.string,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  _search: PropTypes.func.isRequired,
  isControlled: PropTypes.bool,
  'data-testid': PropTypes.string.isRequired,
};

Search.defaultProps = {
  theme: null,
  placeholder: '',
  value: null,
  isControlled: false,
};

export default Search;
