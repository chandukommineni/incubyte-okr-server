import {CreateKeyResultDto} from "../../key-results/dto/create-key-result.dto";

export class CreateObjectiveDto {
    title: string;
    description: string;
    keyResults:CreateKeyResultDto[];
}