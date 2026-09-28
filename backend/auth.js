const jwt = require('jsonwebtoken');

const SECRET_KEY = "supersecret_for_demo_purposes_only";

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function generateAccessToken(user) {
  return jwt.sign(user, SECRET_KEY, { expiresIn: '10h' });
}

module.exports = { authenticateToken, generateAccessToken };
