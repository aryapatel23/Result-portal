// This is a basic template. Replace with your actual admin authentication logic.
const jwt = require('jsonwebtoken');

// Protect any authenticated route
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized - No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Admin-only access
const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Teacher and Admin access
const protectTeacher = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log('❌ protectTeacher: No token provided');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 protectTeacher: Decoded role:', decoded.role);
    if (decoded.role !== 'teacher' && decoded.role !== 'admin') {
      console.log('❌ protectTeacher: Forbidden role:', decoded.role);
      return res.status(403).json({ message: 'Teacher or Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ protectTeacher: Token error:', error.message);
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Student-only access
const protectStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Student access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

// Check specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  protectAdmin,
  protectTeacher,
  protectStudent,
  authorize
};