import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm'
import { Ticket } from './ticket.entity'
import { User } from 'src/users/entities/user.entity'

@Entity('ticket_comment')
export class TicketComment {
  @PrimaryGeneratedColumn('increment') id: number

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ type: 'text' }) content: string

  @CreateDateColumn() createdAt: Date
}
