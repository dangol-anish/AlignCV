import { Router } from "express";
import usersRoutes from "./usersRoutes";
import testRoutes from "./testRoutes";
import uploadRoutes from "./uploadRoutes";

const router = Router();

router.use("/users", usersRoutes);
router.use("/test", testRoutes);
router.use("/upload", uploadRoutes);

export default router;
