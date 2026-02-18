import {Injectable} from '@nestjs/common';
import {PrismaService} from "../prisma.service";
import {type CreateObjectiveDto} from "./dto/createObjective.dto";
import {UpdateObjectiveDto} from "./dto/updateObjective.dto";
import {ObjectiveNotFoundException} from "../exceptions/custom-exceptions/objective-not-fount-exception";
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/client";
import {ScheduleService} from "../schedule.service";
import {ConfigService} from "@nestjs/config";
import {GoogleGenerativeAI, SchemaType} from '@google/generative-ai';
import {z} from 'zod';


export class ChatDto {
    role: string;
    content: string
}


@Injectable()
export class ObjectivesService {
    private model;
    private ObjectiveSchema = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        keyResults: z.array(
            z.object({
                description: z.string().min(1),
            })
        ),
    });

    constructor(private prismaService: PrismaService, private readonly scheduleService: ScheduleService, private configService: ConfigService) {
        const genAI = new GoogleGenerativeAI(
            this.configService.get<string>('GEMINI_API_KEY')!,
        );

        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
        });

    }

    getAll() {
        return this.prismaService.objective.findMany();
    }

    getAllWithKeyResults() {
        return this.prismaService.objective.findMany({
            include: {
                keyResults: true,
            },
        });
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

        const objective = await this.prismaService.$transaction(async (tx) => {
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
        this.scheduleService.addEmailJob({
            to: 'chandu@yopmail.com',
            subject: 'Object Created',
            body: 'Your object was created successfully with id: ' + objective.id,
        });
        return objective
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
        if (objevtive &&
            objevtive.keyResults.length > 0) {
            for (const keyResult of objevtive.keyResults) {
                if (keyResult.isCompleted === false) {
                    return false;
                }
            }
        }
        return true;

    }

    async generate(query: string) {
        const prompt = `
You are a JSON generator.
Your task is to convert the user's input into a valid JSON object .
Rules:
Output ONLY valid JSON.
Do NOT include explanations, markdown, comments, or extra text.
For the derived title generate a suitable description which is concise and captures the essence of the title.
The "title" must summarize the main objective.
Extract measurable or actionable sub-points as "keyResults".
If no key results are mentioned, then you can add 2 most important key results related to the title.
Always return both fields: "title" and "keyResults".
Ensure JSON is syntactically valid.

User Input:
${query}
`;
        const result = await this.model.generateContent({
            contents: [{role: 'user', parts: [{text: prompt}]}],
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        title: {type: SchemaType.STRING},
                        description: {type: SchemaType.STRING},
                        keyResults: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    description: {type: SchemaType.STRING},
                                },
                                required: ['description'],
                            },
                        },
                    },
                    required: ['title', 'description', 'keyResults'],
                },
            },
        });
        const response = await result.response
        const generatedObjective = JSON.parse(response.text());
        const validated = this.ObjectiveSchema.parse(generatedObjective);

        return this.create(validated);
    }

    async chat(query: string,data:ChatDto[]) {
        const objectives = await this.getAllWithKeyResults()
        const prompt = `Role: You are a grounded OKR Chatbot.Task: Your sole purpose is to provide responses based strictly on the Objectives and Key Results (OKRs) appended to this prompt.
Rules:
Source Grounding: Answer using only the information provided in the appended OKRs.if user query is not related to the appended OKRs, respond with "I'm sorry, I can only answer questions related to the provided OKRs."
Output Format: Output ONLY the response text. Do not include markdown, explanations, headers, or any meta-commentary.
Constraint: Do not generate JSON. Act as a conversational assistant that stays strictly within the bounds of the provided data.
Appended OKRs:${JSON.stringify(objectives)}
These are Previous Conversations between the user and you:
${JSON.stringify(data)}
User Input:${query}`

        const result = await this.model.generateContent({
            contents: [{role: 'user', parts: [{text: prompt}]}],
        })
        return result.response.text();
    }
}

