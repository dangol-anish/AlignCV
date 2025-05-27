import { Router } from "express";
import usersRoutes from "./usersRoutes";
import testRoutes from "./testRoutes";

const router = Router();

router.use("/users", usersRoutes);
router.use("/test", testRoutes);

export default router;
