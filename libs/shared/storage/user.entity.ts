import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Action } from './action.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telegramId: number;

  @Column({ nullable: true })
  referrerId: number;

  @OneToMany(() => Action, (action) => action.user)
  actions: Action[];
}
