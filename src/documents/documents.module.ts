import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DocumentsService } from './documents.service'
import { DocumentsController } from './documents.controller'
import { Document } from './entities/document.entity'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Document]), forwardRef(() => RolesModule), forwardRef(() => UsersModule)],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
