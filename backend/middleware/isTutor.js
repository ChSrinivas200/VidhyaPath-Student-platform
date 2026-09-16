// backend/middleware/isTutor.js

module.exports = function(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'tutor') {
    return res.status(403).json({ 
      message: 'Access denied: Only authorized tutors can perform this action.' 
    });
  }

  next();
};
