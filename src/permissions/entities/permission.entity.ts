import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, Index } from 'typeorm'
import { Role } from '../../roles/entities/role.entity'

@Entity()
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ unique: true })
  @Index()
  name: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  resource: string

  @Column({ nullable: true })
  action: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[]
}
