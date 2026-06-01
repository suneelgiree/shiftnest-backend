import { Review } from './Review';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Room } from './Room';
import { RoomBooking } from './RoomBooking';
import { SavedRoom } from './SavedRoom';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'varchar', default: 'user' })
  role: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  accessExpiresAt: Date | null;

  @OneToMany(() => Room, (room) => room.owner)
  rooms: Room[];

  @OneToMany(() => RoomBooking, (booking) => booking.user)
  roomBookings: RoomBooking[];

  @OneToMany(() => SavedRoom, (saved) => saved.user)
  savedRooms: SavedRoom[];

  @OneToMany(() => Review, (r) => r.reviewer)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
