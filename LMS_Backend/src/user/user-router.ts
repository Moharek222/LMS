import { Router } from "express";
import { addUser, validator  } from "./user-controllers/add-teacher";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { getAllUsers } from "./user-controllers/get-all-users";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "./user-model";
import { getUserById } from "./user-controllers/get-user-by-id";
import { updateUser } from "./user-controllers/update-user";



const router = Router();

router.post("/",
    isAuthenticated,
    isAuthorized(Role.Admin),
    validator,
    handleValidationErrors,
    addUser);

router.get("/",
    isAuthenticated,
    isAuthorized(Role.Admin),
    getAllUsers);

router.get("/:id",
    isAuthenticated,
    isAuthorized(Role.Admin),
    getUserById);

router.put("/:id",
    isAuthenticated,
    isAuthorized(Role.Admin),
    updateUser);


export default router;