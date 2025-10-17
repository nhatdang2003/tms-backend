export class MessageConstant {
  static readonly SLUG_NOT_FOUND = `Không tìm thấy {entity} với slug {slug}`
  static readonly ID_NOT_FOUND = `Không tìm thấy {entity} với ID {id}`

  static getSlugNotFoundMessage(entity: string, slug: string): string {
    return this.SLUG_NOT_FOUND.replace('{entity}', entity).replace('{slug}', slug)
  }

  static getIdNotFoundMessage(entity: string, id: number): string {
    return this.ID_NOT_FOUND.replace('{entity}', entity).replace('{id}', id.toString())
  }
}
