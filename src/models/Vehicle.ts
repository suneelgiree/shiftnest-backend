import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Driver } from './Driver';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  vehicleType: string;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseFare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 800 })
  helperRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 300 })
  serviceFee: number;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Driver, (d) => d.vehicle)
  drivers: Driver[];
}

