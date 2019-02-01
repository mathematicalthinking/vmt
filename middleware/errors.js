module.exports.sendError = {
  InternalError: function(err, res) {
    res.status(500).json({
      errorMessage: err || "Internal Error"
    });
  },
  NotFoundError: function(err, res) {
    res.status(404).json({
      errorMessage: err || "Not Found"
    });
  },
  BadMethodError: function(err, res) {
    res.status(405).json({
      errorMessage: err || "Bad Method"
    });
  },
  NotAuthorizedError: function(err, res) {
    res.status(403).json({
      errorMessage: err || "Not Authorized"
    });
  },
  InvalidCredentialsError: function(err, res) {
    res.status(401).json({
      errorMessage: err || "Unauthorized"
    });
  },
  InvalidArgumentError: function(err, res) {
    res.status(409).json({
      errorMessage: err || "Invalid Argument"
    });
  },
  InvalidContentError: function(err, res) {
    res.status(400).json({
      errorMessage: err || "Invalid Content"
    });
  }
};
