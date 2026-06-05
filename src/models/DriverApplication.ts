import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('driver_applications')
export class DriverApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  // Which vehicle TYPE/tier they intend to drive (matches Vehicle.vehicleType)
  @Column({ type: 'varchar' })
  vehicleType: string;

  @Column({ type: 'varchar' })
  plateNumber: string;

  @Column({ type: 'varchar' })
  idCardPhotoUrl: string;

  @Column({ type: 'varchar' })
  numberplatePhotoUrl: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  reviewNote: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}