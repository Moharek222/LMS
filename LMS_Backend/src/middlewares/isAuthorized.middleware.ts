import { RequestHandler } from "express";
import { Role } from "../user/user-model";

export const isAuthorized = (...roles: Role[]): RequestHandler => {
  return (req, res, next) => {
    // console.log("=== Auth Debug ===");
    // console.log("req.user data:", (req as any).user);
    // console.log("Required roles from route:", roles);

    if (req.user) {
      if (roles.includes(req.user.role)) {
        next();
      } else { 
        res.status(403).json({ message: "Forbidden" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};