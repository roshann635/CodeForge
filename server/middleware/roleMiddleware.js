/**
 * Role-based Authorization Middleware
 * Usage: requireRole("ADMIN"), requireRole("FACULTY"), requireRole("FACULTY", "ADMIN")
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user missing" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
