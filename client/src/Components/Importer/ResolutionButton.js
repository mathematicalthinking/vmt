import React from 'react';
import PropTypes from 'prop-types';

export default function ResolutionButton(props) {
  const {
    usernameChoice,
    emailChoice,
    newUserChoice,
    onSelect,
    selection,
  } = props;

  const _handleSelect = (select) => {
    if (select === selection()) {
      onSelect(null);
    } else {
      onSelect(select);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {usernameChoice && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => _handleSelect(usernameChoice)}
          onKeyPress={() => _handleSelect(usernameChoice)}
          title="Use existing username"
        >
          <i
            className="fas fa-user"
            style={{
              color: selection() === usernameChoice ? '#66ff00' : 'black',
            }}
          />
        </div>
      )}
      {emailChoice && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => _handleSelect(emailChoice)}
          onKeyPress={() => _handleSelect(emailChoice)}
          title="Use existing email"
        >
          <i
            className="fas fa-envelope"
            style={{ color: selection() === emailChoice ? '#66ff00' : 'black' }}
          />
        </div>
      )}
      {newUserChoice && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => _handleSelect(newUserChoice)}
          onKeyPress={() => _handleSelect(newUserChoice)}
          title="Create new user"
        >
          <i
            className="fas fa-user-plus"
            style={{
              color: selection() === newUserChoice ? '#66ff00' : 'black',
            }}
          />
        </div>
      )}
    </div>
  );
}

ResolutionButton.propTypes = {
  usernameChoice: PropTypes.shape({}),
  emailChoice: PropTypes.shape({}),
  newUserChoice: PropTypes.shape({}),
  onSelect: PropTypes.func.isRequired,
  selection: PropTypes.func,
};

ResolutionButton.defaultProps = {
  usernameChoice: null,
  emailChoice: null,
  newUserChoice: null,
  selection: null,
};
