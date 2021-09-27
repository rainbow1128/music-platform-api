import { ArgumentMetadata } from '@nestjs/common'
import { IsOptional, IsString, IsDefined } from 'class-validator'
import { InvalidArgumentsError } from '@common/errors'
import { ValidationPipe } from '../validation.pipe'

class TestModel {
  @IsString()
  public prop1: string

  @IsDefined({
    message: undefined
  })
  public prop2: string

  @IsOptional()
  @IsString()
  public optionalProp: string
}

describe('ValidationPipe', () => {
  let target: ValidationPipe
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: TestModel,
    data: ''
  }

  beforeEach(() => {
    target = new ValidationPipe()
  })

  describe('transform', () => {
    describe('when validation passes', () => {
      it('should return the same value passed', async () => {
        const testObj = { prop1: 'value1', prop2: 'value2' }
        const res = await target.transform(testObj, {} as any)
        expect(res).toEqual(testObj)
      })
    })

    describe('when validation fails', () => {
      it('should throw InvalidArgumentsError', async () => {
        const testObj = {
          prop1: 'value1'
        }
        const promise = target.transform(testObj, metadata)
        await expect(promise).rejects.toThrow(InvalidArgumentsError)
        await expect(promise).rejects.toHaveProperty('metadata.fields.0.name', 'prop2')
        await expect(promise).rejects.toHaveProperty('metadata.fields.0.message')
      })
    })
  })

  describe('formatErrors', () => {
    it('should return normal if no constraints', () => {
      const error = ValidationPipe.formatErrors([{ property: 'name' }])
      expect(error).toBeInstanceOf(InvalidArgumentsError)
      expect(error).toHaveProperty('metadata.fields.0.message', [])
    })
  })
})
