import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Room } from './Room';

@Entity('room_bookings')
export class RoomBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  bookingId: string; // Format: RM12345

  @ManyToOne(() => User, (user) => user.roomBookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'uuid' })
  roomId: string;

  @Column({ type: 'enum', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'PENDING' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 500 })
  bookingFee: number; // NPR 500 booking fee

  @Column({ type: 'varchar', nullable: true })
  notes: string;

  @CreateDateColumn()
  bookingDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
