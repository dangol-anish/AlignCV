import { Router } from "express";
import { testSupabaseConnection } from "../controllers/testController";

const router = Router();

router.get("/supabase", testSupabaseConnection);

export default router;
