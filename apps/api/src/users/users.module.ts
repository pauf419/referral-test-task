import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../libs/shared/storage/user.entity';
import { Action } from '../../../../libs/shared/storage/action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Action])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
