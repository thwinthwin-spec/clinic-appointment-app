/** JWT create/verify helpers. The secret comes from config/env.js. */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(user) {
  const id = String(user._id);

  const payload = {
    id: id,
    role: user.role,
  };

  const options = {
    expiresIn: env.jwtExpiresIn,
    subject: id,
  };

  const token = jwt.sign(payload, env.jwtSecret, options);
  return token;
}

/** Returns the decoded payload, or null when the token is bad or expired. */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded;
  } catch (error) {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
