import { BaseQueryParams } from 'src/common/base/base.service'

export interface DocumentQueryParamDto extends BaseQueryParams {
  title?: string
  createdById?: number
}
