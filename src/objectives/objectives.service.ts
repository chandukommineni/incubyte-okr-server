import {Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import {type CreateObjectiveDto} from "./dto/createObjective.dto";
import {UpdateObjectiveDto} from "./dto/updateObjective.dto";
import {ObjectiveNotFoundException} from "../exceptions/custom-exceptions/objective-not-fount-exception";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";

@Injectable()
export class ObjectivesService {
    constructor(private prismaService: PrismaService) {
    }

    getAll() {
        return this.prismaService.objective.findMany();
    }


    async getById(id: string) {
        try {
            return await this.prismaService.objective.findUniqueOrThrow({
                where: {id},
                include: {
                    keyResults: true,
                },
            });
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new ObjectiveNotFoundException(id);
            }
            throw error;
        }
    }

    async create(objectiveDto: CreateObjectiveDto) {
        const {title, description, keyResults} = objectiveDto;

        return this.prismaService.$transaction(async (tx) => {
            const objective = await tx.objective.create({
                data: {title, description},
            });

            if (keyResults?.length) {
                await tx.keyResult.createMany({
                    data: keyResults.map((kr) => ({
                        description: kr.description,
                        objectiveId: objective.id,
                    })),
                });
            }
            return objective;
        });
    }

    async delete(id: string) {
        try {
            return await this.prismaService.objective.delete({
                where: {id},
            });
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new ObjectiveNotFoundException(id);
            }
            throw error;
        }
    }

    async update(id: string, objective: UpdateObjectiveDto) {
        try {
            return await this.prismaService.objective.update({
                where: {id: id},
                data: objective
            })
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new ObjectiveNotFoundException(id);
            }
            throw error;
        }

    }

    async getStatus(objectiveId: string) {
        const objevtive = await this.prismaService.objective.findUnique({
            where: {id: objectiveId},
            include: {
                keyResults: true
            }
        })
        if(objevtive &&
         objevtive.keyResults.length > 0){
            for(const keyResult of objevtive.keyResults){
                if(keyResult.isCompleted === false){
                    return false;
                }
            }
        }
        return true;

    }
}

