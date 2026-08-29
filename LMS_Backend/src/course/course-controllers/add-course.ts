import { RequestHandler } from "express";
import StatusCodes from "http-status-codes";
import { Course } from "../course-model";
import {body} from "express-validator";


export const addCourseValidation = [
    body("title")
        .trim()  
        .notEmpty().withMessage("Title is required")
        .isString().withMessage("Title must be a string")
        .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long"), 

    body("isPublished")
        .optional() 
        .isBoolean().withMessage("isPublished must be a boolean (true or false)"),
];

interface IRequest {
    title:string,
    isPublished?:boolean
}
interface IResponse {
    message: string
    data?: unknown
}

export const addCourse:RequestHandler<{},IResponse,IRequest> = async (req,res,next) =>{
    try{
        const { title , isPublished } = req.body;
        const course = await Course.create({ title, isPublished });
        res.status(StatusCodes.CREATED).json({
            message: "Course created successfully",
            data: course
        });
    }catch(err){
        next(err);
    }
}