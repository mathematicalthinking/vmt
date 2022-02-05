import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'Components';
import classes from './carousel.css';

export function Carousel({
  step: initialStep,
  onStepChange,
  noNext,
  children,
}) {
  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    if (initialStep) setStep(initialStep);
  }, [initialStep]);

  React.useEffect(() => {
    onStepChange(step);
  }, [step]);

  const childArray = React.useMemo(() => React.Children.toArray(children), [
    children,
  ]);

  const previous = () => {
    setStep((prevState) => (prevState === 1 ? 1 : prevState - 1));
  };

  const next = () => {
    setStep((prevState) =>
      prevState === childArray.length ? prevState : prevState + 1
    );
  };

  const stepDisplays = [];
  for (let i = 0; i < childArray.length; i++) {
    stepDisplays.push(
      <div
        key={`step-${i + 1}`}
        className={[
          classes.Step,
          i <= step - 1 ? classes.CompletedStep : null,
        ].join(' ')}
      />
    );
  }

  return (
    <div className={classes.Container}>
      {step > 1 ? (
        <i
          onClick={previous}
          onKeyPress={previous}
          role="button"
          tabIndex="-1"
          className={['fas', 'fa-arrow-left', classes.BackIcon].join(' ')}
        />
      ) : null}
      {childArray[step - 1]}
      {!noNext.includes(step) && (
        <div className={classes.ModalButton}>
          <Button m={5} click={next} data-testid="next-step-carousel">
            Next
          </Button>
        </div>
      )}
      <div className={classes.StepDisplayContainer}>{stepDisplays}</div>
    </div>
  );
}

Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  step: PropTypes.number,
  onStepChange: PropTypes.func,
  noNext: PropTypes.arrayOf(PropTypes.number),
};

Carousel.defaultProps = {
  step: null,
  onStepChange: () => {},
  noNext: [],
};

export default Carousel;
