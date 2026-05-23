import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Vehicle } from './Vehicle';
import { ShiftBooking } from './ShiftBooking';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Vehicle, (v) => v.drivers)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'varchar', nullable: true })
  plateNumber: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  totalRatings: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  currentLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  currentLng: number;

  @OneToMany(() => ShiftBooking, (sb) => sb.driver)
  shiftBookings: ShiftBooking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

