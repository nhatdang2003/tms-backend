import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { Ticket } from './ticket.entity'
import { User } from 'src/users/entities/user.entity'
import { PhotoType } from 'src/common/enum/ticket.enum'

@Entity('ticket_photo')
export class TicketPhoto {
  @PrimaryGeneratedColumn('increment') id: number

  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket

  @Index()
  @Column({ type: 'enum', enum: PhotoType, default: PhotoType.BEFORE })
  type: PhotoType

  @Column() url: string
  @Column({ nullable: true }) mime?: string

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User

  @CreateDateColumn() createdAt: Date
}
