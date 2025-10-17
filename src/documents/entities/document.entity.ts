import { Entity, Column, Index } from 'typeorm'
import { BaseEntity } from 'src/common/base/base.entity'

@Entity()
export class Document extends BaseEntity {
  @Column({ unique: true })
  @Index()
  title: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  url: string
}
