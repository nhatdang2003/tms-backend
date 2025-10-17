import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm'
import { Ticket } from './ticket.entity'
import { User } from 'src/users/entities/user.entity'

@Entity('ticket_history')
export class TicketHistory {
  @PrimaryGeneratedColumn('increment') id: number

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User

  @Column() action: string

  @Column({ type: 'jsonb', nullable: true })
  data?: any

  @CreateDateColumn() createdAt: Date
}
