import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationsService } from './organizations.service'
import { OrganizationsController } from './organizations.controller'
import { Organization } from './entities/organization.entity'
import { UsersModule } from 'src/users/users.module'
import { RolesModule } from 'src/roles/roles.module'

@Module({
  imports: [TypeOrmModule.forFeature([Organization]), forwardRef(() => UsersModule), forwardRef(() => RolesModule)],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
