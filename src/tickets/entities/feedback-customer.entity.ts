import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm'
import { Ticket } from './ticket.entity'

@Entity('feedback_customer')
export class FeedbackCustomer {
  @PrimaryGeneratedColumn('increment') id: number

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket

  @Column({ type: 'text', nullable: true }) comment?: string
  @Column({ nullable: true }) channel?: string

  @CreateDateColumn() createdAt: Date
}
