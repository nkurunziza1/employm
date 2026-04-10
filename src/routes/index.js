import { Router } from "express";
import authRoutes from "./auth.routes.js";
import employeeRoutes from "./employee.routes.js";
import taskRoutes from "./task.routes.js";
import attendanceRoutes from "./attendance.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/employees", employeeRoutes);
router.use("/tasks", taskRoutes);
router.use("/attendance", attendanceRoutes);

export default router;
