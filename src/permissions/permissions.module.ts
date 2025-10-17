import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionsService } from './permissions.service'
import { PermissionsController } from './permissions.controller'
import { Permission } from './entities/permission.entity'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([Permission]), forwardRef(() => RolesModule), forwardRef(() => UsersModule)],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
