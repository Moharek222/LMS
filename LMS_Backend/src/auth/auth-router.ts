import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { teacherLogin, loginValidation } from "./teacher-login";
import { logout } from "./logout";
// import { forgotPassword } from "./forget-password";


const router = Router();


router.post('/teacher-login',
    loginValidation,
    handleValidationErrors,
    teacherLogin);

router.post("/logout",logout);

export default router;