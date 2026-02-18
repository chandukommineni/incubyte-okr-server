import {Body, Controller, Delete, Get, Param, Patch, Post, Query, UseFilters} from '@nestjs/common';
import {ChatDto, ObjectivesService} from "./objectives.service";
import {CreateObjectiveDto} from "./dto/createObjective.dto";
import {UpdateObjectiveDto} from "./dto/updateObjective.dto";
import {CustomExceptionFilter} from "../exceptions/custom-exception-filter";

@Controller()
@UseFilters(CustomExceptionFilter)
export class ObjectivesController {
    constructor(private readonly objectivesService: ObjectivesService) {
    }

    @Get()
    getAll() {
        return this.objectivesService.getAll()
    }

    @Get(":objectiveId")
    getById(@Param("objectiveId") objectiveId: string) {
        return this.objectivesService.getById(objectiveId);
    }

    @Get(':objectiveId/status')
    getStatus(@Param('objectiveId') objectiveId:string){
        return this.objectivesService.getStatus(objectiveId);
    }

    @Post()
    create(@Body() objective: CreateObjectiveDto) {
        return this.objectivesService.create(objective)
    }

    @Delete(":id")
    delete(@Param("id") id: string) {
        return this.objectivesService.delete(id);
    }

    @Patch(":id") update(@Param("id") id: string, @Body() objective: UpdateObjectiveDto) {
        return this.objectivesService.update(id, objective);
    }

    @Post("/generate")
    generate(@Body() {query}: {query: string}) {
        return this.objectivesService.generate(query);
    }

    @Post("/chat")
    chat(@Body() {query,data}:{query:string,data: ChatDto[]}) {
        return this.objectivesService.chat(query,data);
    }



}
