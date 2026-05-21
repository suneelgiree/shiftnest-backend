import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Room } from './Room';

@Entity('saved_rooms')
@Unique(['userId', 'roomId'])
export class SavedRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.savedRooms)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Room, (room) => room.savedBy, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column({ type: 'uuid' })
  roomId: string;

  @CreateDateColumn()
  savedAt: Date;
}
