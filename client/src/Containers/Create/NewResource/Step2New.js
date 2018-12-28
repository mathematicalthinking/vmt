import React from 'react';
import { RadioBtn, TextInput, Button } from '../../../Components/';
import classes from '../create.css';
const Step2New = props => {
  return (
    <div>
      <div className={classes.RadioButtons}>
        <RadioBtn name='geogebra' checked={props.ggb} check={props.setGgb}>GeoGebra</RadioBtn>
        <RadioBtn name='desmos' checked={!props.ggb} check={props.setGgb}>Desmos</RadioBtn>
      </div>
      <div>
      {props.ggb 
        ? <div className={classes.Geogebra}>
          <div>Import a GeoGebra Workspace</div>
          <div className={classes.GeogebraButton}><Button>Select a Geogebra File</Button></div>
        </div> 
        : <TextInput
            light
            name='desmosLink'
            label='Paste a Desmos workspace'
            change={this.changeHandler}
            width='100%'
          />
        }
      </div>
    </div>
  )
}

export default Step2New;