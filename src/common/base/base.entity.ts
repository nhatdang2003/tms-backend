import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: number

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy?: number

  @Column({ name: 'version', default: 1 })
  version: number

  @BeforeInsert()
  private setCreatedDate(): void {
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  @BeforeUpdate()
  private setUpdatedDate(): void {
    this.updatedAt = new Date()
    this.version = (this.version || 0) + 1
  }
}
