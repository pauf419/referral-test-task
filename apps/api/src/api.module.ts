import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ActionsModule } from './actions/actions.module';
import { DatabaseModule } from '../../../libs/shared/database/database.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, UsersModule, ActionsModule],
})
export class ApiModule {}
