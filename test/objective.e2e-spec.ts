import {AppModule} from "../src/app.module";
import {Test} from "@nestjs/testing";
import request from "supertest";
import {PrismaService} from "../src/prisma.service";
import {INestApplication} from "@nestjs/common";
import {execSync} from "node:child_process";
import {PostgreSqlContainer, StartedPostgreSqlContainer} from "@testcontainers/postgresql";

jest.setTimeout(30000)

describe("Objective", () => {
    let app: INestApplication
    let prismService: PrismaService
    let postgresContainer: StartedPostgreSqlContainer;

    beforeAll(async () => {

        postgresContainer = await new PostgreSqlContainer('postgres:15').start();

        const databaseUrl = postgresContainer.getConnectionUri();

        process.env.DATABASE_URL = databaseUrl;

        execSync('pnpx prisma migrate deploy', {env: process.env});
    });

    afterAll(async () => {
        if (postgresContainer) {
            await postgresContainer.stop();
        }
    });

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [AppModule]
        }).compile()
        app = module.createNestApplication()
        await app.init()
        prismService = app.get(PrismaService)

    });

    afterEach(async () => {
        await app.close()
    });

    describe("GET /objectives", () => {
        it("should return a list of objectives", async () => {

            const objective = {
                title: "Objective 1",
                description: "Description 1",
            }
            const createdObjective = await prismService.objective.create({
                data: objective

            })

            return request(app.getHttpServer())
                .get("/objectives")
                .expect(200)
                .expect([
                    {
                        id: createdObjective.id,
                        title: objective.title,
                        description: objective.description,
                    }
                ])

        })
    })

    describe("POST /objectives", () => {
        it("should create a new objective", async () => {
            const objective = {
                title: "Objective 2",
                description: "Description 2",
            }
            const response = await request(app.getHttpServer())
                .post('/objectives').send(objective).expect(201)
            expect(response.body).toMatchObject(objective);
        })
    })
})