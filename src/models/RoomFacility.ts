import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './Room';

@Entity('room_facilities')
export class RoomFacility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ['WIFI', 'KITCHEN', 'PARKING', 'BATHROOM', 'FURNISHED', 'WATER_24_7', 'BALCONY', 'AC', 'HEATING'] })
  facility: string;

  @ManyToOne(() => Room, (room) => room.facilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'uuid' })
  roomId: string;
}
