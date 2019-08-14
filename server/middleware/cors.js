const { getMtSsoUrl, getEncUrl } = require('../config/app-urls');

let allowedOrigins = `${getMtSsoUrl()}, ${getEncUrl()}`;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  allowedOrigins += ', http://localhost:3000';
}
console.log('allowedOrigins: ', allowedOrigins);
module.exports = (req, res, next) => {
  // Website you wish to allow to connect
  const { origin } = req.headers;
  const originHeader = allowedOrigins.includes(origin) ? origin : null;

  res.setHeader('Access-Control-Allow-Origin', originHeader);
  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,Authorization'
  );
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
};
