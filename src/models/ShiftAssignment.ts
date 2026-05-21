import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Shift } from './Shift';

@Entity('shift_assignments')
@Index(['userId', 'shiftId'], { unique: true })
export class ShiftAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Shift, (shift) => shift.assignments)
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  @Column()
  shiftId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
