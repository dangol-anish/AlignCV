import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error details:", {
    message: err.message,
    stack: err.stack,
    code: err.code,
  });

  // Handle Supabase errors
  if (err.code?.startsWith("PGRST")) {
    return res.status(400).json({
      success: false,
      message: "Database error occurred",
      error: err.message,
    });
  }

  // Handle authentication errors
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      error: err.message,
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: err.message,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}
