import { plainToInstance, ClassConstructor } from 'class-transformer'
import { FindOptionsWhere, IsNull, ObjectLiteral, Repository } from 'typeorm'
import { PaginatedData } from '../interceptors/global-response.interceptor'
import { NotFoundException } from '@nestjs/common'

export interface BaseQueryParams {
  search?: string
  sort?: string
  order?: 'ASC' | 'DESC'
  limit?: number
  page?: number
}

export abstract class BaseService<T extends ObjectLiteral> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly searchableFields: string[] = [],
    protected readonly sortableFields: string[] = [],
  ) {}

  /**
   * Converts an entity to a DTO.
   * @param DtoClass - The DTO class to transform the entity into.
   * @param entity - The entity to convert.
   * @return A DTO instance.
   * @template D - The type of the DTO class.
   * @template E - The type of the entity being converted.
   */
  protected toDto<D, E>(DtoClass: ClassConstructor<D>, entity: E): D {
    return plainToInstance(DtoClass, entity, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * Converts an array of entities to an array of DTOs.
   * @param DtoClass - The DTO class to transform the entities into.
   * @param entities - The array of entities to convert.
   * @return An array of DTOs.
   * @template D - The type of the DTO class.
   * @template E - The type of the entity being converted.
   */
  protected toDtoList<D, E>(DtoClass: ClassConstructor<D>, entities: E[]): D[] {
    return plainToInstance(DtoClass, entities, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * Get a filtered query builder with pagination, sorting, and searching capabilities.
   * @param queryBuilder - The TypeORM query builder to apply filters to.
   * This query builder should be initialized with the entity name, e.g., `this.repository.createQueryBuilder('entity')`.
   * @param query - The query parameters containing search, sort, order, limit, and
   * page.
   * @param DtoClass - The DTO class to transform the results into.
   * @return A promise that resolves to a PaginatedData object containing the
   * filtered items, total count, current page, and limit.
   * @template D - The type of the DTO class.
   * @template E - The type of the entity being queried.
   */
  protected async getFilteredQueryBuilder<D>(
    queryBuilder: any,
    query: BaseQueryParams,
    DtoClass: ClassConstructor<D>,
  ): Promise<PaginatedData<D>> {
    const { search, sort = 'createdAt', order = 'DESC', limit = 10, page = 1 } = query
    const queryAlias = queryBuilder.alias || 'entity'
    if (this.searchableFields.length > 0 && search?.trim()) {
      const searchConditions = this.searchableFields.map((field) => `${queryAlias}.${field} ILIKE :search`).join(' OR ')
      queryBuilder.andWhere(`(${searchConditions})`, { search: `%${search.trim()}%` })
    }
    const sortField = this.sortableFields.includes(sort) ? sort : 'createdAt'
    const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    queryBuilder.orderBy(`${queryAlias}.${sortField}`, sortDirection as 'ASC' | 'DESC')
    const take = Number(limit)
    const skip = (Number(page) - 1) * take
    queryBuilder.skip(skip).take(take)
    const [items, total] = await queryBuilder.getManyAndCount()
    return {
      items: this.toDtoList(DtoClass, items),
      total,
      page: Number(page),
      limit: Number(limit),
    }
  }

  /**
   * Finds an entity by its ID.
   * @param id - The ID of the entity to find.
   * @param relations - Optional array of relations to load with the entity.
   * @return A promise that resolves to the found entity or null if not found.
   */
  public async findById(id: any, relations: string[] = []): Promise<T | null> {
    return await this.repository.findOne({
      where: {
        id,
      } as FindOptionsWhere<T>,
      relations,
    })
  }

  /**
   * Finds an entity by its slug.
   * This method is useful for entities that have a unique slug field.
   * @param slug - The slug of the entity to find.
   * @param relations - Optional array of relations to load with the entity.
   * @return A promise that resolves to the found entity.
   * @throws NotFoundException if the entity with the given slug does not exist.
   */
  public async findOneBySlug(slug: string, relations: string[] = []): Promise<T | null> {
    return await this.repository.findOne({
      where: {
        slug,
      } as unknown as FindOptionsWhere<T>,
      relations,
    })
  }

  public async findNextPrimaryKey(): Promise<number> {
    const result = await this.repository.query(
      `SELECT nextval(pg_get_serial_sequence('${this.repository.metadata.tableName}', 'id')) AS nextid`,
    )
    return result[0].nextid
  }
}
