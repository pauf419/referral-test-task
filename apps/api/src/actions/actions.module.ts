import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Action } from '../../../../libs/shared/storage/action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Action])],
  controllers: [ActionsController],
  providers: [ActionsService],
})
export class ActionsModule {}
