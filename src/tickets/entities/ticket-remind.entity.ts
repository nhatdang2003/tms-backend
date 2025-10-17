import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm'
import { Ticket } from './ticket.entity'
import { User } from 'src/users/entities/user.entity'

@Entity('ticket_remind')
export class TicketRemind {
  @PrimaryGeneratedColumn('increment') id: number

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User

  @Column({ type: 'timestamp' }) remindAt: Date
  @Column({ type: 'text', nullable: true }) note?: string

  @CreateDateColumn() createdAt: Date
}
