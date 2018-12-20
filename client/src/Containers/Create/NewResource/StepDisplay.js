import React from 'react';
import classes from './stepDisplay.css';

const StepDisplay = React.memo((props) => {
  return (
    <div className={classes.StepDisplay}>
      <div className={classes.Container}>
        <ul className={classes.progressbar}>
          <li className={[classes.step1, classes.activeStep].join(" ")}>
            <span>Select Problem</span>
          </li>
          <li className="step-2">
            <span>Select className</span>
          </li>
          <li className="step-3 {{if (greater-equal currentStep.value 3) 'active-step'}}">
            <span>Upload Files</span>
          </li>
          <li className="step-4 {{if (greater-equal currentStep.value 4) 'active-step'}}">
            <span>Match Students</span>
          </li>
          <li className="step-5 {{if (greater-equal currentStep.value 5) 'active-step'}}">
            <span>Review</span>
          </li>
        </ul>
      </div>
    </div>
  )
})

export default StepDisplay;