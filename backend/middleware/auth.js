const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

  // 1. Get the token from the request header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // 2. If no token found, block access
  if (!token) {
    return res.status(401).json({ message: '❌ No token. Access denied.' });
  }

  try {
    // 3. Verify the token is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user info to the request so routes can use it
    req.user = decoded;

    // 5. Move on to the actual route
    next();

  } catch (err) {
    res.status(401).json({ message: '❌ Invalid token.' });
  }
};

// Middleware that checks if the user is an admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '❌ Admin access required.' });
  }
  next();
};

module.exports = { auth, adminOnly };