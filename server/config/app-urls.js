module.exports.getMtSsoUrl = () => {
  return process.env.MT_SSO_URL;
};

module.exports.getVmtIssuerId = () => {
  return process.env.JWT_ISSUER_ID;
};

module.exports.getMtIssuerId = () => {
  return process.env.MT_SSO_JWT_ISSUER_ID;
};

module.exports.getEncUrl = () => {
  return process.env.ENC_URL;
};

module.exports.getEncIssuerId = () => {
  return process.env.ENC_JWT_ISSUER_ID;
};
