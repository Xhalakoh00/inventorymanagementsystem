const jwt = require('jsonwebtoken');

// 1. Verify if user is logged in
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info (id, role) to the request object
    req.user = decoded;
    next(); // Pass to the next function/controller
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// 2. Restrict route to admins only
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access forbidden. Admin role required.' });
  }
};

module.exports = { verifyToken, isAdmin };