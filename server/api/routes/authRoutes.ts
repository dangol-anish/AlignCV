import { Router } from "express";
import {
  signIn,
  signUp,
  googleOAuthStart,
  googleOAuthCallback,
} from "../controllers/authController";

const router = Router();

router.post("/signin", signIn);
router.post("/signup", signUp);
router.get("/google", googleOAuthStart);
router.get("/google/callback", googleOAuthCallback);

export default router;
