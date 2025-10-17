import { TicketStatus } from 'src/common/enum/ticket.enum'
import { User } from 'src/users/entities/user.entity'
import { Organization } from 'src/organizations/entities/organization.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('increment') id: number

  @Index({ unique: true })
  @Column()
  code: string

  @Column() title: string
  @Column({ type: 'text', nullable: true }) description?: string

  @Column() customerName: string
  @Column({ nullable: true }) customerPhone?: string
  @Column({ nullable: true }) customerEmail?: string
  @Column({ nullable: true }) customerAddress?: string
  @Column('double precision', { nullable: true }) customerLat?: number
  @Column('double precision', { nullable: true }) customerLng?: number

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_technician_id' })
  assignedTechnician?: User

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'assigned_organization_id' })
  assignedOrganization?: Organization

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.NEW })
  status: TicketStatus

  @Column({ type: 'timestamp', nullable: true }) scheduledAt?: Date

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy?: User

  @CreateDateColumn() createdAt: Date
  @UpdateDateColumn() updatedAt: Date
}
