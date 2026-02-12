// src/exceptions/custom-exception-filter.ts
import {ExceptionFilter, Catch, ArgumentsHost, HttpStatus} from "@nestjs/common";
import {Response} from "express";
import {ObjectiveNotFoundException} from "./custom-exceptions/objective-not-fount-exception";

@Catch(ObjectiveNotFoundException)
export class CustomExceptionFilter implements ExceptionFilter {
    catch(exception: ObjectiveNotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = HttpStatus.NOT_FOUND;

        const body = {statusCode: status, message: exception.message || "Objective not found"};

        response.status(status).json(body);
    }
}
