import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { loginHandler, loginValidation } from "./login";
import { logout } from "./logout";
// import { forgotPassword } from "./forget-password";


const router = Router();


router.post('/login',
    loginValidation,
    handleValidationErrors,
    loginHandler);

router.post("/logout",logout);

export default router;