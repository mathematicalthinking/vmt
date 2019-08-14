import React from 'react';
import PropTypes from 'prop-types';
import { RadioBtn, Aux } from '../../../Components';
import classes from '../create.css';

const Step3 = (props) => {
  const { privacySetting, check } = props;
  return (
    <Aux>
      <div className={classes.RadioButtons}>
        <RadioBtn
          name="public"
          checked={privacySetting === 'public'}
          check={() => check('public')}
        >
          Public
        </RadioBtn>
        <RadioBtn
          name="private"
          checked={privacySetting === 'private'}
          check={() => check('private')}
        >
          Private
        </RadioBtn>
      </div>
      <p className={classes.PrivacyDesc}>
        Anyone can join public resources, joining private resources requires
        permission from one of the resources facilitators.
        {/* If you don't want your resource to show up in the
        community list you can set your resource to super-private in settings
        after you create it. */}
      </p>
    </Aux>
  );
};

Step3.propTypes = {
  privacySetting: PropTypes.string.isRequired,
  check: PropTypes.func.isRequired,
};
export default Step3;
