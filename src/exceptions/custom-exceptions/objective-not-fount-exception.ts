import { HttpException, HttpStatus } from '@nestjs/common';

export class ObjectiveNotFoundException extends HttpException {
    constructor(id?: string) {
        const message = id ? `Objective with id ${id} not found` : 'Objective not found';
        super({ message }, HttpStatus.NOT_FOUND);
    }
}
