const { isNonEmptyObject } = require('../middleware/utils/helpers');

module.exports.sendError = {
  InternalError(err, res) {
    res.status(500).json({
      errorMessage: err || 'Internal Error',
    });
  },
  NotFoundError(err, res) {
    res.status(404).json({
      errorMessage: err || 'Not Found',
    });
  },
  BadMethodError(err, res) {
    res.status(405).json({
      errorMessage: err || 'Bad Method',
    });
  },
  NotAuthorizedError(err, res) {
    res.status(403).json({
      errorMessage: err || 'Not Authorized',
    });
  },
  InvalidCredentialsError(err, res) {
    res.status(401).json({
      errorMessage: err || 'Unauthorized',
    });
  },
  InvalidArgumentError(err, res) {
    res.status(409).json({
      errorMessage: err || 'Invalid Argument',
    });
  },
  InvalidContentError(err, res) {
    res.status(400).json({
      errorMessage: err || 'Invalid Content',
    });
  },
};

module.exports.handleError = (err, res) => {
  let status;
  let message;

  const jwtErrorNames = [
    'TokenExpiredError',
    'JsonWebTokenError',
    'NotBeforeError',
  ];

  const isJwtError =
    typeof err.name === 'string' && jwtErrorNames.includes(err.name);
  const isAxiosError = isNonEmptyObject(err.response);

  if (isJwtError) {
    status = 401;
    message = 'Invalid or expired credentials';
  } else if (isAxiosError) {
    status = err.response.status || 500;
    message = err.response.data || 'Internal Error';
  } else {
    status = 500;
    message = 'Internal Error';
  }

  return res.status(status).json({
    errorMessage: message,
  });
};
