import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectivesModule } from './objectives/objectives.module';
import { KeyResultsModule } from './key-results/key-results.module';
import {RouterModule} from "@nestjs/core";
import { ConfigModule } from '@nestjs/config';
import {ScheduleService} from "./schedule.service";
import {ScheduleModule} from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(), // important
    ObjectivesModule,
    KeyResultsModule,
    RouterModule.register([
      {
        path: 'objectives',
        module: ObjectivesModule,
        children: [
          {
            path: ':objectiveId/key-results',
            module: KeyResultsModule,
          },
        ],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService,ScheduleService],
})
export class AppModule {

}
