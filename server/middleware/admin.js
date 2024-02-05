const User = require('../models/User');
const ssoService = require('../services/sso');

async function forceUserLogout(userId, reqUser) {
  try {
    const userToBeLoggedOut = await User.findById(userId);

    if (!userToBeLoggedOut) {
      throw new Error('NotFoundError');
    }

    const results = await ssoService.forceLogout(
      userToBeLoggedOut.ssoId,
      reqUser
    );

    if (results.isSuccess) {
      const updatedVmtUser = await User.findByIdAndUpdate(
        userId,
        { doForceLogout: true },
        { new: true }
      );
      results.user = updatedVmtUser;
    }

    return results;
  } catch (err) {
    console.log('Error in admin force logout: ', err.message);
    throw err; // Rethrow the error to handle it in the calling context
  }
}

module.exports = { forceUserLogout };
