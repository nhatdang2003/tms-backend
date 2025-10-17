import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Exclude } from 'class-transformer'
import { RefreshToken } from '../../auth/entities/refresh-token.entity'
import { Organization } from '../../organizations/entities/organization.entity'
import { STATUS } from 'src/common/enum/user-type.enum'
import { Role } from 'src/roles/entities/role.entity'
import { BaseEntity } from 'src/common/base/base.entity'

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index()
  email: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ nullable: true })
  phoneNumber: string

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string

  @Column({
    type: 'enum',
    enum: STATUS,
    default: STATUS.ACTIVE,
  })
  status: STATUS

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, { cascade: true })
  refreshTokens: RefreshToken[]

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role: Role

  @Column({ nullable: true })
  roleId: number

  @ManyToOne(() => Organization, (organization) => organization.users, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization

  @Column({ nullable: true })
  organizationId: number

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt()
      this.password = await bcrypt.hash(this.password, salt)
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const isValid = await bcrypt.compare(password, this.password)
    return isValid
  }

  hasRole(roleName: string): boolean {
    if (!this.role) {
      return false
    }
    return this.role.name === roleName
  }

  get getRoleName(): string {
    if (!this.role) {
      return ''
    }
    return this.role.name
  }

  get getOrganizationName(): string {
    if (!this.organization) {
      return ''
    }
    return this.organization.name
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }
}
