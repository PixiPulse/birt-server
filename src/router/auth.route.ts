import { Router } from "express";
import { getAdminToken, getUserToken } from "../controller/auth.controller";

const router = Router();

router.post("/user", getUserToken);
router.post("/admin", getAdminToken);

export default router;
