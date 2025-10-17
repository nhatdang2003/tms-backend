import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from './entities/user.entity'
import { RolesModule } from '../roles/roles.module'
import { Role } from 'src/roles/entities/role.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), forwardRef(() => RolesModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
