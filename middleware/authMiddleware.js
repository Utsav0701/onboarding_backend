import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token; // Extract token from cookie named 'token'

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token found in cookies" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach admin data to request object
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res
      .status(401)
      .json({ message: "Not authorized, token invalid or expired" });
  }
};

// Middleware to restrict access to admins only
export const adminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
