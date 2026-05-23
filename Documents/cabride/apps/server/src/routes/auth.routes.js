import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validate(["name", "email", "password", "role"]), register);
router.post("/login",    validate(["email", "password"]), login);
router.get ("/me",       protect, getMe);

export default router;
