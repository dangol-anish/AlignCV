import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

export function verifySupabaseJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    SUPABASE_JWT_SECRET,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      (req as any).user = decoded;
      next();
    }
  );
}
