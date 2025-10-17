import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { BaseEntity } from 'src/common/base/base.entity'

@Entity()
export class Organization extends BaseEntity {
  @Column({ unique: true })
  @Index()
  name: string

  @Column({ nullable: true })
  description: string

  @OneToMany(() => User, (user) => user.organization)
  users: User[]
}
