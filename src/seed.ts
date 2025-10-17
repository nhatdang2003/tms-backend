import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { initializeTransactionalContext } from 'typeorm-transactional'
import { UsersService } from './users/users.service'
import { OrganizationsService } from './organizations/organizations.service'
import { RolesService } from './roles/roles.service'
import { PermissionsService } from './permissions/permissions.service'
import { DocumentsService } from './documents/documents.service'
import { TicketsService } from './tickets/tickets.service'
import { TicketStatus } from './common/enum/ticket.enum'

async function bootstrap() {
  const logger = new Logger('Seed')
  initializeTransactionalContext()
  const app = await NestFactory.createApplicationContext(AppModule)

  try {
    logger.log('Starting seeding...')
    const usersService = app.get(UsersService)
    const organizationsService = app.get(OrganizationsService)
    const rolesService = app.get(RolesService)
    const permissionsService = app.get(PermissionsService)
    const documentsService = app.get(DocumentsService)
    const ticketsService = app.get(TicketsService)

    await createSampleOrganizations(organizationsService, logger)
    await createSamplePermissions(permissionsService, logger)
    await createSampleRoles(rolesService, logger)
    await assignPermissionsToRoles(rolesService, permissionsService, logger)
    await createSampleUsers(usersService, logger)
    await createSampleDocuments(documentsService, logger)
    await createSampleTickets(ticketsService, usersService, logger)
    logger.log('Seeding completed successfully!')
  } catch (error) {
    logger.error('Seeding failed!')
    logger.error(error)
  } finally {
    await app.close()
  }
}

async function createSampleUsers(usersService: UsersService, logger: Logger) {
  const sampleUsers = [
    {
      email: 'technician@example.com',
      firstName: 'Regular',
      lastName: 'User',
      password: 'password123!',
      roleId: 3,
      organizationId: 1,
      phoneNumber: '0909090909',
    },
    {
      email: 'supervisor@example.com',
      firstName: 'Supervisor',
      lastName: 'Supervisor',
      password: 'password123!',
      roleId: 2,
      organizationId: 1,
      phoneNumber: '0909090909',
    },
    {
      email: 'admin@example.com',
      firstName: 'Super',
      lastName: 'Admin',
      password: 'password123!',
      roleId: 1,
      organizationId: 1,
      phoneNumber: '0909090909',
    },
  ]

  for (const userData of sampleUsers) {
    try {
      const user = await usersService.create(userData)
      logger.log(`Created user: ${userData.email} with roles: ${userData.roleId}`)
    } catch (error) {
      logger.error(`Failed to create user ${userData.email}: ${error}`)
    }
  }
}

async function createSampleOrganizations(organizationsService: OrganizationsService, logger: Logger) {
  const sampleOrganizations = [
    {
      name: 'Agro Group',
      description: 'Organization 1 description',
    },
    {
      name: 'Agritech Group',
      description: 'Agritech Group description',
    },
  ]

  for (const organizationData of sampleOrganizations) {
    try {
      const organization = await organizationsService.create(organizationData)
      logger.log(`Created organization: ${organizationData.name}`)
    } catch (error) {
      logger.error(`Failed to create organization ${organizationData.name}: ${error}`)
    }
  }
}

async function createSampleRoles(rolesService: RolesService, logger: Logger) {
  const sampleRoles = [
    {
      name: 'ADMIN',
    },
    {
      name: 'SUPERVISOR',
    },
    {
      name: 'TECHNICIAN',
    },
  ]

  for (const roleData of sampleRoles) {
    try {
      const role = await rolesService.create(roleData)
      logger.log(`Created role: ${roleData.name}`)
    } catch (error) {
      logger.error(`Failed to create role ${roleData.name}: ${error}`)
    }
  }
}

async function createSamplePermissions(permissionsService: PermissionsService, logger: Logger) {
  const permissions = [
    { name: 'admin:*', description: 'Quyền admin toàn quyền', resource: 'admin', action: '*' },

    { name: 'users:create', description: 'Tạo người dùng mới', resource: 'users', action: 'create' },
    { name: 'users:read', description: 'Xem danh sách người dùng', resource: 'users', action: 'read' },
    { name: 'users:update', description: 'Cập nhật thông tin người dùng', resource: 'users', action: 'update' },
    { name: 'users:delete', description: 'Xóa người dùng', resource: 'users', action: 'delete' },
    { name: 'users:manage', description: 'Quản lý người dùng (tất cả quyền)', resource: 'users', action: 'manage' },

    { name: 'roles:create', description: 'Tạo vai trò mới', resource: 'roles', action: 'create' },
    { name: 'roles:read', description: 'Xem danh sách vai trò', resource: 'roles', action: 'read' },
    { name: 'roles:update', description: 'Cập nhật vai trò', resource: 'roles', action: 'update' },
    { name: 'roles:delete', description: 'Xóa vai trò', resource: 'roles', action: 'delete' },

    { name: 'permissions:create', description: 'Tạo quyền mới', resource: 'permissions', action: 'create' },
    { name: 'permissions:read', description: 'Xem danh sách quyền', resource: 'permissions', action: 'read' },
    { name: 'permissions:update', description: 'Cập nhật quyền', resource: 'permissions', action: 'update' },
    { name: 'permissions:delete', description: 'Xóa quyền', resource: 'permissions', action: 'delete' },
    { name: 'permissions:add', description: 'Thêm quyền vào role', resource: 'permissions', action: 'add' },
    { name: 'permissions:remove', description: 'Xóa quyền khỏi role', resource: 'permissions', action: 'remove' },

    { name: 'organizations:create', description: 'Tạo đơn vị mới', resource: 'organizations', action: 'create' },
    { name: 'organizations:read', description: 'Xem danh sách đơn vị', resource: 'organizations', action: 'read' },
    {
      name: 'organizations:update',
      description: 'Cập nhật thông tin đơn vị',
      resource: 'organizations',
      action: 'update',
    },
    { name: 'organizations:delete', description: 'Xóa đơn vị', resource: 'organizations', action: 'delete' },

    { name: 'profile:read', description: 'Xem thông tin cá nhân', resource: 'profile', action: 'read' },
    { name: 'profile:update', description: 'Cập nhật thông tin cá nhân', resource: 'profile', action: 'update' },

    { name: 'reports:read', description: 'Xem báo cáo', resource: 'reports', action: 'read' },
    { name: 'reports:export', description: 'Xuất báo cáo', resource: 'reports', action: 'export' },

    { name: 'system:health', description: 'Kiểm tra tình trạng hệ thống', resource: 'system', action: 'health' },
    { name: 'system:logs', description: 'Xem logs hệ thống', resource: 'system', action: 'logs' },
    { name: 'system:backup', description: 'Sao lưu hệ thống', resource: 'system', action: 'backup' },

    { name: 'files:upload', description: 'Tải lên tệp tin', resource: 'files', action: 'upload' },
    { name: 'files:download', description: 'Tải xuống tệp tin', resource: 'files', action: 'download' },
    { name: 'files:delete', description: 'Xóa tệp tin', resource: 'files', action: 'delete' },

    { name: 'analytics:view', description: 'Xem thống kê phân tích', resource: 'analytics', action: 'view' },
    { name: 'analytics:export', description: 'Xuất dữ liệu phân tích', resource: 'analytics', action: 'export' },

    { name: 'documents:create', description: 'Tạo tài liệu mới', resource: 'documents', action: 'create' },
    { name: 'documents:read', description: 'Xem danh sách tài liệu', resource: 'documents', action: 'read' },
    { name: 'documents:update', description: 'Cập nhật tài liệu', resource: 'documents', action: 'update' },
    { name: 'documents:delete', description: 'Xóa tài liệu', resource: 'documents', action: 'delete' },
    { name: 'documents:download', description: 'Tải xuống tài liệu', resource: 'documents', action: 'download' },

    { name: 'settings:read', description: 'Xem cài đặt hệ thống', resource: 'settings', action: 'read' },
    { name: 'settings:update', description: 'Cập nhật cài đặt hệ thống', resource: 'settings', action: 'update' },

    { name: 'tickets:create', description: 'Tạo ticket mới', resource: 'tickets', action: 'create' },
    { name: 'tickets:read', description: 'Xem danh sách tickets', resource: 'tickets', action: 'read' },
    { name: 'tickets:update', description: 'Cập nhật thông tin ticket', resource: 'tickets', action: 'update' },
    { name: 'tickets:delete', description: 'Xóa ticket', resource: 'tickets', action: 'delete' },
    { name: 'tickets:comment', description: 'Thêm comment vào ticket', resource: 'tickets', action: 'comment' },
    { name: 'tickets:remind', description: 'Thêm remind vào ticket', resource: 'tickets', action: 'remind' },
    { name: 'tickets:assign', description: 'Phân công ticket cho technician', resource: 'tickets', action: 'assign' },
  ]

  for (const permissionData of permissions) {
    try {
      await permissionsService.create(permissionData)
      logger.log(`Created permission: ${permissionData.name}`)
    } catch (error) {
      logger.error(
        `Failed to create permission ${permissionData.name}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

async function assignPermissionsToRoles(
  rolesService: RolesService,
  permissionsService: PermissionsService,
  logger: Logger,
) {
  try {
    const adminRole = await rolesService.findByName('ADMIN')
    const allPermissions = await permissionsService.findAll({ limit: 100, page: 1 })
    const allPermissionIds = allPermissions.items.map((p) => p.id)
    await rolesService.assignPermissions(adminRole.id, allPermissionIds)
    logger.log(`Assigned ${allPermissionIds.length} permissions to ADMIN role`)

    const supervisorRole = await rolesService.findByName('SUPERVISOR')
    const supervisorPermissionNames = [
      'users:read',
      'users:update',
      'users:create',
      'organizations:read',
      'organizations:update',
      'reports:read',
      'reports:export',
      'analytics:view',
      'profile:read',
      'profile:update',
      'files:upload',
      'files:download',
      'documents:create',
      'documents:read',
      'documents:update',
      'documents:delete',
      'documents:download',
      'tickets:create',
      'tickets:read',
      'tickets:update',
      'tickets:delete',
      'tickets:comment',
      'tickets:remind',
      'tickets:assign',
    ]
    const supervisorPermissions: number[] = []
    for (const permName of supervisorPermissionNames) {
      try {
        const perm = await permissionsService.findByName(permName)
        supervisorPermissions.push(perm.id)
      } catch (error) {
        logger.warn(`Permission ${permName} not found for SUPERVISOR`)
      }
    }
    await rolesService.assignPermissions(supervisorRole.id, supervisorPermissions)
    logger.log(`Assigned ${supervisorPermissions.length} permissions to SUPERVISOR role`)

    const technicianRole = await rolesService.findByName('TECHNICIAN')
    const technicianPermissionNames = [
      'users:read',
      'organizations:read',
      'profile:read',
      'profile:update',
      'files:upload',
      'files:download',
      'reports:read',
      'documents:create',
      'documents:read',
      'documents:download',
      'tickets:read',
      'tickets:update',
      'tickets:remind',
    ]
    const technicianPermissions: number[] = []
    for (const permName of technicianPermissionNames) {
      try {
        const perm = await permissionsService.findByName(permName)
        technicianPermissions.push(perm.id)
      } catch (error) {
        logger.warn(`Permission ${permName} not found for TECHNICIAN`)
      }
    }
    await rolesService.assignPermissions(technicianRole.id, technicianPermissions)
    logger.log(`Assigned ${technicianPermissions.length} permissions to TECHNICIAN role`)
  } catch (error) {
    logger.error(`Failed to assign permissions to roles: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function createSampleDocuments(documentsService: DocumentsService, logger: Logger) {
  const sampleDocuments = [
    {
      title: 'Báo cáo tháng 10/2025',
      description: 'Báo cáo tổng kết hoạt động tháng 10 năm 2025',
      url: 'https://example.com/documents/bao-cao-thang-10-2025.pdf',
    },
    {
      title: 'Hướng dẫn sử dụng hệ thống',
      description: 'Tài liệu hướng dẫn chi tiết cách sử dụng hệ thống quản lý',
      url: 'https://example.com/documents/huong-dan-su-dung.pdf',
    },
    {
      title: 'Quy trình làm việc',
      description: 'Quy trình và flow công việc chuẩn của công ty',
      url: 'https://example.com/documents/quy-trinh-lam-viec.docx',
    },
  ]

  for (const documentData of sampleDocuments) {
    try {
      await documentsService.create(documentData)
      logger.log(`Created document: ${documentData.title}`)
    } catch (error) {
      logger.error(
        `Failed to create document ${documentData.title}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

async function createSampleTickets(ticketsService: TicketsService, usersService: UsersService, logger: Logger) {
  try {
    const users = await usersService.findAll({ limit: 10, page: 1 }, 'ADMIN', 'Agro Group')
    const adminUser = users.items.find((u) => u.role?.name === 'ADMIN')
    const supervisorUser = users.items.find((u) => u.role?.name === 'SUPERVISOR')
    const technicianUser = users.items.find((u) => u.role?.name === 'TECHNICIAN')
    const firstOrganization = { id: 1 }

    if (!adminUser || !supervisorUser || !technicianUser) {
      logger.error('Cannot find required users for ticket seeding')
      return
    }

    const sampleTickets = [
      {
        title: 'Sửa chữa máy bơm nước khu vực A',
        description:
          'Máy bơm nước ở khu vực A bị hỏng, cần kiểm tra và sửa chữa ngay lập tức. Hiện tại không có nước cung cấp cho khu vực này.',
        customerName: 'Nguyễn Văn An',
        customerPhone: '0901234567',
        customerEmail: 'nguyenvanan@example.com',
        customerAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
        customerLat: 10.762622,
        customerLng: 106.660172,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Lắp đặt hệ thống tưới tiêu tự động',
        description:
          'Khách hàng yêu cầu lắp đặt hệ thống tưới tiêu tự động cho vườn rau diện tích 500m2. Bao gồm: đường ống, van điều khiển, timer và cảm biến độ ẩm.',
        customerName: 'Trần Thị Bình',
        customerPhone: '0912345678',
        customerEmail: 'tranthibinh@example.com',
        customerAddress: '456 Đường DEF, Xã GHI, Huyện JKL, Tỉnh MNO',
        customerLat: 10.823099,
        customerLng: 106.629664,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Bảo trì định kỳ hệ thống phun sương',
        description:
          'Thực hiện bảo trì định kỳ hệ thống phun sương tại nhà kính. Kiểm tra và thay thế các béc phun bị tắc, vệ sinh đường ống.',
        customerName: 'Lê Văn Cường',
        customerPhone: '0923456789',
        customerEmail: 'levanculong@example.com',
        customerAddress: '789 Đường PQR, Phường STU, Quận VWX, TP.HCM',
        customerLat: 10.776889,
        customerLng: 106.700806,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Khắc phục sự cố rò rỉ đường ống chính',
        description:
          'Đường ống cấp nước chính bị rò rỉ tại vị trí gần cổng vào. Cần khắc phục khẩn cấp để tránh lãng phí nước và ảnh hưởng đến hoạt động sản xuất.',
        customerName: 'Phạm Thị Dung',
        customerPhone: '0934567890',
        customerEmail: 'phamthidung@example.com',
        customerAddress: '321 Đường YZ, Thị trấn ABC, Huyện DEF, Tỉnh GHI',
        customerLat: 10.762622,
        customerLng: 106.660172,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Tư vấn và báo giá hệ thống tưới nhỏ giọt',
        description:
          'Khách hàng cần tư vấn về hệ thống tưới nhỏ giọt cho vườn cây ăn trái diện tích 2 hecta. Yêu cầu khảo sát thực địa và báo giá chi tiết.',
        customerName: 'Hoàng Văn Em',
        customerPhone: '0945678901',
        customerEmail: 'hoangvanem@example.com',
        customerAddress: '654 Đường JKL, Xã MNO, Huyện PQR, Tỉnh STU',
        customerLat: 10.823099,
        customerLng: 106.629664,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Sửa chữa máy bơm áp lực cao',
        description:
          'Máy bơm áp lực cao Model XYZ-2000 bị giảm công suất, áp lực không đạt yêu cầu. Cần kiểm tra và thay thế linh kiện nếu cần thiết.',
        customerName: 'Vũ Thị Phượng',
        customerPhone: '0956789012',
        customerEmail: 'vuthiphuong@example.com',
        customerAddress: '987 Đường VWX, Phường YZ, Quận ABC, TP.HCM',
        customerLat: 10.776889,
        customerLng: 106.700806,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Lắp đặt cảm biến độ ẩm đất tự động',
        description:
          'Khách hàng yêu cầu lắp đặt hệ thống cảm biến độ ẩm đất tự động kết nối với hệ thống tưới hiện có. Bao gồm 10 cảm biến và bộ điều khiển trung tâm.',
        customerName: 'Đỗ Văn Giang',
        customerPhone: '0967890123',
        customerEmail: 'dovangiang@example.com',
        customerAddress: '147 Đường DEF, Thị trấn GHI, Huyện JKL, Tỉnh MNO',
        customerLat: 10.762622,
        customerLng: 106.660172,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Bảo trì hệ thống lọc nước tưới',
        description:
          'Thực hiện bảo trì định kỳ hệ thống lọc nước tưới: thay lõi lọc, vệ sinh bể chứa, kiểm tra van và đồng hồ đo.',
        customerName: 'Bùi Thị Hoa',
        customerPhone: '0978901234',
        customerEmail: 'buithihoa@example.com',
        customerAddress: '258 Đường PQR, Xã STU, Huyện VWX, Tỉnh YZ',
        customerLat: 10.823099,
        customerLng: 106.629664,
        assignedTechnicianId: technicianUser.id,
        assignedOrganizationId: firstOrganization.id,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    for (const ticketData of sampleTickets) {
      try {
        const ticket = await ticketsService.create(ticketData, adminUser.id)
        logger.log(`Created ticket: ${ticketData.title} (ID: ${ticket.id})`)

        if (Math.random() > 0.5) {
          await ticketsService.addComment(
            ticket.id,
            {
              content: 'Đã liên hệ với khách hàng và xác nhận thời gian làm việc.',
            },
            supervisorUser.id,
          )

          await ticketsService.addComment(
            ticket.id,
            {
              content: 'Đã chuẩn bị đầy đủ thiết bị và công cụ cần thiết.',
            },
            technicianUser.id,
          )
        }

        if (Math.random() > 0.7) {
          await ticketsService.addRemind(
            ticket.id,
            {
              remindAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
              note: 'Nhắc nhở kiểm tra tình trạng thiết bị trước khi đến hiện trường',
            },
            supervisorUser.id,
          )
        }

        if (Math.random() > 0.8) {
          await ticketsService.updateStatus(ticket.id, { status: TicketStatus.COMPLETED }, technicianUser.id)

          await ticketsService.addFeedback(ticket.id, {
            comment: 'Dịch vụ rất tốt, kỹ thuật viên làm việc chuyên nghiệp và nhanh chóng.',
            channel: 'phone',
          })
        }
      } catch (error) {
        logger.error(
          `Failed to create ticket ${ticketData.title}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }

    logger.log(`Created ${sampleTickets.length} sample tickets with comments, reminds, and feedback`)
  } catch (error) {
    logger.error(`Failed to create sample tickets: ${error instanceof Error ? error.message : String(error)}`)
  }
}

void bootstrap().catch((error) => {
  const logger = new Logger('Seed')
  logger.error('Failed to seed database')
  logger.error(error)
  process.exit(1)
})
