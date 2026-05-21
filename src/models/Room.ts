import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { RoomFacility } from './RoomFacility';
import { RoomImage } from './RoomImage';
import { RoomBooking } from './RoomBooking';
import { SavedRoom } from './SavedRoom';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar' })
  location: string;

  @Column({ type: 'varchar' })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number | null;

  @Column({ type: 'enum', enum: ['1RK', '1BHK', '2BHK', 'FLAT'], default: '1BHK' })
  roomType: string;

  @Column({ type: 'int', default: 1 })
  bedrooms: number;

  @Column({ type: 'int', default: 1 })
  bathrooms: number;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.rooms)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ type: 'uuid' })
  ownerId: string;

  @OneToMany(() => RoomFacility, (facility) => facility.room, { cascade: true })
  facilities: RoomFacility[];

  @OneToMany(() => RoomImage, (image) => image.room, { cascade: true })
  images: RoomImage[];

  @OneToMany(() => RoomBooking, (booking) => booking.room)
  bookings: RoomBooking[];

  @OneToMany(() => SavedRoom, (saved) => saved.room)
  savedBy: SavedRoom[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
