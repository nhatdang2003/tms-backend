import { ValidationPipe, ValidationError, BadRequestException, ValidationPipeOptions } from '@nestjs/common'

interface ValidationErrorField {
  field: string
  message: string
}

export class CustomValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = this.formatErrors(validationErrors)
        return new BadRequestException({
          message: 'Validation failed',
          errors,
          errorCode: 400001,
        })
      },
    })
  }

  private formatErrors(errors: ValidationError[], parentPath = ''): ValidationErrorField[] {
    return errors.flatMap((error) => {
      const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property

      if (error.children && error.children.length > 0) {
        return this.formatErrors(error.children, propertyPath)
      }

      const constraints = error.constraints || {}
      return Object.keys(constraints).map((key) => ({
        field: propertyPath,
        message: constraints[key],
      }))
    })
  }
}
