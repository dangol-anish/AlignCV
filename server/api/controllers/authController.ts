import { Request, Response, NextFunction } from "express";
import { supabase } from "../../database";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const REDIRECT_URI =
  process.env.GOOGLE_OAUTH_REDIRECT_URI ||
  "http://localhost:3000/api/auth/google/callback";

// Google OAuth: Step 1 - Redirect to Supabase's Google OAuth URL
export async function googleOAuthStart(req: Request, res: Response) {
  const params = new URLSearchParams({
    provider: "google",
    redirect_to: REDIRECT_URI,
  });
  const url = `${SUPABASE_URL}/auth/v1/authorize?${params.toString()}`;
  return res.redirect(url);
}

// Google OAuth: Step 2 - Handle callback, exchange code for session
export async function googleOAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Missing code");
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  try {
    // Exchange code for session
    const { data, error } = await admin.auth.exchangeCodeForSession(code);
    if (error) {
      return res.status(401).send("OAuth exchange failed: " + error.message);
    }
    // Set session as cookie (or return as JSON if you prefer)
    res.cookie("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7 * 1000, // 1 week
    });
    // Redirect to dashboard
    return res.redirect("/dashboard");
  } catch (err) {
    return res.status(500).send("OAuth callback error");
  }
}

export async function signUp(req: Request, res: Response, next: NextFunction) {
  const { name, email, password } = req.body;
  console.log("[SIGNUP] Request body:", req.body);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    console.log("[SIGNUP] Supabase response:", { data, error });
    if (error) {
      // Check for already registered error
      if (
        error.message?.toLowerCase().includes("user already registered") ||
        error.message?.toLowerCase().includes("already registered") ||
        error.status === 400
      ) {
        console.log("[SIGNUP] Already registered error for:", email);
        return res.status(409).json({
          message:
            "This email is already registered. Please sign in with Google.",
        });
      }
      console.log("[SIGNUP] Other error:", error);
      return res.status(400).json({ message: error.message });
    }
    console.log("[SIGNUP] Success:", data);
    // Success: return user and session
    return res.status(201).json({ user: data.user, session: data.session });
  } catch (err) {
    console.log("[SIGNUP] Exception:", err);
    next(err);
  }
}

export async function signIn(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  console.log("[SIGNIN] Request body:", req.body);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("[SIGNIN] Supabase response:", { data, error });
    if (error) return res.status(400).json({ message: error.message });
    return res.status(200).json({ user: data.user, session: data.session });
  } catch (err) {
    console.log("[SIGNIN] Exception:", err);
    next(err);
  }
}
