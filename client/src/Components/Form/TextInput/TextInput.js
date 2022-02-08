/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './textInput.css';
import lightClasses from './lightTextInput.css';

class TextInput extends Component {
  textInput = React.createRef();

  componentDidMount() {
    const { focus } = this.props;
    if (focus) {
      this.textInput.current.focus();
    }
  }

  componentDidUpdate() {
    const { focus } = this.props;
    if (focus) {
      this.textInput.current.focus();
    }
  }

  render() {
    const {
      light,
      autoComplete,
      type,
      width,
      name,
      placeholder,
      change,
      onKeyDown,
      value,
      size,
      label,
    } = this.props;
    const styles = light ? lightClasses : classes;
    let derivedAutoComplete = autoComplete || type;
    if (type === 'password') {
      derivedAutoComplete = 'current-password';
    }
    return type === 'textarea' ? (
      <textarea
        ref={this.textInput}
        autoComplete={derivedAutoComplete}
        className={styles.Input}
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={change}
        onKeyDown={onKeyDown}
        style={{
          fontSize: size,
          overflow: 'hidden',
          resize: 'none',
          height: 'auto',
          minWidth: '8.125rem',
        }}
        // eslint-disable-next-line react/destructuring-assignment
        data-testid={this.props['data-testid'] || null}
      />
    ) : (
      <div className={styles.Container} style={{ width }}>
        <input
          ref={this.textInput}
          autoComplete={derivedAutoComplete}
          className={styles.Input}
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          onChange={change}
          onKeyDown={onKeyDown}
          value={value}
          style={{ fontSize: size }}
          // eslint-disable-next-line react/destructuring-assignment
          data-testid={this.props['data-testid'] || null}
        />
        {label ? (
          <label className={styles.Label} htmlFor={name}>
            {label}
          </label>
        ) : null}
      </div>
    );
  }
}

TextInput.propTypes = {
  light: PropTypes.bool,
  autoComplete: PropTypes.string,
  type: PropTypes.string,
  width: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  change: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func,
  value: PropTypes.string,
  size: PropTypes.string,
  label: PropTypes.string,
};

TextInput.defaultProps = {
  autoComplete: null,
  type: null,
  width: null,
  placeholder: null,
  onKeyDown: null,
  label: null,
  size: null,
  light: false,
  value: undefined,
};

export default TextInput;
