import { BaseQueryParams } from 'src/common/base/base.service'
import { STATUS } from 'src/common/enum/user-type.enum'

export interface UserQueryParamDto extends BaseQueryParams {
  status?: STATUS
  role?: string
  organizationId?: number
}
