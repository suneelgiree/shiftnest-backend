import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.reviews)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'uuid' })
  reviewerId: string;

  @Column({ type: 'varchar' })
  targetType: string;

  @Column({ type: 'uuid' })
  targetId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', unique: true })
  bookingRef: string;

  @CreateDateColumn()
  createdAt: Date;
}
