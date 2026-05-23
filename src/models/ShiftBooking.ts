import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Driver } from './Driver';
import { Vehicle } from './Vehicle';

@Entity('shift_bookings')
export class ShiftBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  bookingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Driver, (d) => d.shiftBookings, { nullable: true })
  @JoinColumn({ name: 'driverId' })
  driver: Driver;

  @Column({ type: 'uuid', nullable: true })
  driverId: string | null;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'varchar' })
  fromLocation: string;

  @Column({ type: 'varchar' })
  toLocation: string;

  @Column({ type: 'date' })
  moveDate: string;

  @Column({ type: 'int', default: 0 })
  helpers: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseFare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  helpersCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 300 })
  serviceFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalFare: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
