import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { teacherLogin, loginValidation as teacherLoginValidation } from "./teacher-login";
import { studentLogin, loginValidation as studentLoginValidation } from "./student-login";
import { registerHandler, registerValidation } from "./register";
import { logout } from "./logout";
// import { forgotPassword } from "./forget-password";

const router = Router();

router.post('/teacher-login',
    teacherLoginValidation,
    handleValidationErrors,
    teacherLogin);

router.post('/student-login',
    studentLoginValidation,
    handleValidationErrors,
    studentLogin);

router.post('/register',
    registerValidation,
    handleValidationErrors,
    registerHandler);

router.post("/logout", logout);

export default router;