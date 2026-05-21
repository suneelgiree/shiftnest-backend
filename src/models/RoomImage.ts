import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './Room';

@Entity('room_images')
export class RoomImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  imageUrl: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number; // For image carousel ordering

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean; // Main image for thumbnail

  @ManyToOne(() => Room, (room) => room.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'uuid' })
  roomId: string;
}
