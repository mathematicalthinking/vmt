import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'Components';
import classes from './carouselModal.css';

function CarouselModal(props) {
  const { steps, buttons, show, onClose } = props;
  const [currentStep, setCurrentStep] = useState(0);

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const getStepsDisplay = (stepNumber) =>
    steps.map((_, i) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={`id-${i}`}
        className={[
          classes.Step,
          i <= stepNumber ? classes.CompletedStep : null,
        ].join(' ')}
      />
    ));

  return (
    <Modal height={600} width={650} show={show} closeModal={onClose}>
      {currentStep > 0 ? (
        <i
          onClick={prevStep}
          onKeyDown={prevStep}
          tabIndex="-1"
          role="button"
          className={['fas', 'fa-arrow-left', classes.BackIcon].join(' ')}
        />
      ) : null}
      <div className={classes.Container}>
        {steps[currentStep]}
        <div className={classes.Row}>{buttons[currentStep]}</div>
      </div>
      <div className={classes.StepDisplayContainer}>
        {getStepsDisplay(currentStep)}
      </div>
    </Modal>
  );
}

CarouselModal.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.node).isRequired,
  buttons: PropTypes.arrayOf(PropTypes.node).isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CarouselModal;
