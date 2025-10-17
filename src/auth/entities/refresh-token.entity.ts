import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'

@Entity()
@Index(['userId', 'isRevoked'])
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  @Index('IDX_refresh_token_token')
  token: string

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @Column({ nullable: true })
  deviceInfo: string

  @Column({ nullable: true })
  ip: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  @Index('IDX_refresh_token_userId')
  userId: number

  @Column({ default: false })
  isRevoked: boolean

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date

  @Column({ nullable: true })
  revokedReason: string
}
