import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Action {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column()
  timestamp: number;

  @ManyToOne(() => User, (user) => user.actions)
  user: User;
}
