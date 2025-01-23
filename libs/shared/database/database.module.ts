import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../libs/shared/storage/user.entity';
import { Action } from '../../../libs/shared/storage/action.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'root.db',
      entities: [User, Action],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
