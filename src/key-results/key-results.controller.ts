import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    Get,
} from '@nestjs/common';
import { KeyResultsService } from './key-results.service';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKeyResultDto } from './dto/update-key-result.dto';

@Controller()
export class KeyResultsController {
    constructor(private readonly keyResultsService: KeyResultsService) {}

    @Post()
    create(
        @Param('objectiveId') objectiveId: string,
        @Body() createKeyResultDto: CreateKeyResultDto,
    ) {
        return this.keyResultsService.create(objectiveId, createKeyResultDto);
    }

    @Get()
    getAllByObjectiveId(@Param('objectiveId') objectiveId: string) {
        return this.keyResultsService.getAllByObjectiveId(objectiveId);
    }

    @Delete(':keyResultId')
    delete(@Param('keyResultId') keyResultId: string) {
        return this.keyResultsService.delete(keyResultId);
    }

    @Patch(':keyResultId')
    update(
        @Param('keyResultId') keyResultId: string,
        @Body() updateKeyResultDto: UpdateKeyResultDto,
    ) {
        return this.keyResultsService.update(keyResultId, updateKeyResultDto);
    }
}
