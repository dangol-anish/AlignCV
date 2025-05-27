import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
} from "../controllers/usersController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.post("/", authMiddleware, createUser);

export default router;
