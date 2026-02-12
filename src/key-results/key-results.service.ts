import {Injectable} from '@nestjs/common';
import {CreateKeyResultDto} from "./dto/create-key-result.dto";
import {PrismaService} from "../prisma.service";
import {UpdateKeyResultDto} from "./dto/update-key-result.dto";
import {ObjectiveNotFoundException} from "../exceptions/custom-exceptions/objective-not-fount-exception";

@Injectable()
export class KeyResultsService {
    constructor(private readonly prismaService: PrismaService) {
    }

    create(objectiveId: string, createKeyResultDto: CreateKeyResultDto) {
        return this.prismaService.keyResult.create({
            data: {...createKeyResultDto, objectiveId}
        })
    }

    delete(id: string) {
        return this.prismaService.keyResult.delete({
            where: {id: id},
        })
    }

    update(id: string, updateKeyResultDto: UpdateKeyResultDto) {
        return this.prismaService.keyResult.update({
            where: {id: id},
            data: updateKeyResultDto
        })
    }

    async getAllByObjectiveId(objectiveId: string) {
        const objective = await this.prismaService.objective.findUnique({
            where: {id: objectiveId},
        });

        if (!objective) {
            throw new ObjectiveNotFoundException(objectiveId);
        }

        return this.prismaService.keyResult.findMany({
            where: {objectiveId: objectiveId},

        })
    }
}
