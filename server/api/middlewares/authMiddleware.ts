import { Request, Response, NextFunction } from "express";
import { supabase } from "../../database";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  // Attach user info to request
  (req as any).user = { id: user.id };
  next();
}
