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

  @Column({ nullable: false, default: 0 })
  xp: number;

  @Column({ nullable: false, default: false })
  xpAccrued: boolean;

  @OneToMany(() => Action, (action) => action.user)
  actions: Action[];
}
