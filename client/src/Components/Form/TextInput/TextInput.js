import React, { Component } from 'react';
import classes from './textInput.css';
import lightClasses from './lightTextInput.css';
class TextInput extends Component {

  textInput = React.createRef();

  componentDidMount(){
    if (this.props.focus) {
      this.textInput.current.focus()
    }
  }

  componentDidUpdate(){
    if (this.props.focus) {
      this.textInput.current.focus()
    }
  }

  render() {
    let styles = this.props.light ? lightClasses : classes;
    let autoComplete = this.props.autoComplete || this.props.type;
    if (this.props.type === 'password') {autoComplete = 'current-password'}
    return (
      <div className={styles.Container} style={{width: this.props.width}}>
        <input
          ref={this.textInput}
          autoComplete={autoComplete}
          className={styles.Input}
          type={this.props.type}
          id={this.props.name}
          name={this.props.name}
          placeholder={this.props.placeholder}
          onChange={this.props.change}
          onKeyDown={this.props.onKeyDown}
          value={this.props.value}
          style={{fontSize: this.props.size}}
          data-testid={this.props['data-testid'] || null}
          />
          {this.props.label ? <label className={styles.Label} htmlFor={this.props.name}>{this.props.label}</label> : null}
      </div>
    )
  }
}

export default TextInput
