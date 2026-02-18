import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObjectivesModule } from './objectives/objectives.module';
import { KeyResultsModule } from './key-results/key-results.module';
import {RouterModule} from "@nestjs/core";
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

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
  providers: [AppService],
})
export class AppModule {

}
