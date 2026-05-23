import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar' })
  bookingRef: string;

  @Column({ type: 'varchar' })
  bookingType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar' })
  method: string;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  gatewayRef: string;

  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
