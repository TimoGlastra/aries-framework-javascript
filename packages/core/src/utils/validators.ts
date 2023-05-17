import type { Constructor } from './mixins'
import type { SingleOrArray } from './type'
import type { ValidationOptions } from 'class-validator'

import { isString, ValidateBy, isInstance, buildMessage } from 'class-validator'

import { asArray } from './array'

export interface IsInstanceOrArrayOfInstancesValidationOptions extends ValidationOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classType: SingleOrArray<new (...args: any[]) => any>
}

/**
 * Checks if the value is a string or the specified instance
 */
export function IsStringOrInstance(targetType: Constructor, validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsStringOrInstance',
      constraints: [targetType],
      validator: {
        validate: (value, args): boolean => isString(value) || isInstance(value, args?.constraints[0]),
        defaultMessage: buildMessage((eachPrefix, args) => {
          if (args?.constraints[0]) {
            return eachPrefix + `$property must be of type string or instance of ${args.constraints[0].name as string}`
          } else {
            return eachPrefix + `IsStringOrInstance decorator expects an object as value, but got falsy value.`
          }
        }, validationOptions),
      },
    },
    validationOptions
  )
}

export function IsInstanceOrArrayOfInstances(
  validationOptions: IsInstanceOrArrayOfInstancesValidationOptions
): PropertyDecorator {
  const classTypes = asArray(validationOptions.classType)

  return ValidateBy(
    {
      name: 'isInstanceOrArrayOfInstances',
      validator: {
        validate: (values) => {
          return (
            asArray(values)
              // all values MUST be instance of one of the class types
              .every((value) => classTypes.some((classType) => isInstance(value, classType)))
          )
        },
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix + `$property must be a instance of one of ${classTypes.map((c) => c.name).join(', ')}`,
          validationOptions
        ),
      },
    },
    validationOptions
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export const UriValidator = /\w+:(\/?\/?)[^\s]+/

export function IsUri(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isUri',
      validator: {
        validate: (value): boolean => {
          return UriValidator.test(value)
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + `$property must be a string that matches regex: ${UriValidator.source}`,
          validationOptions
        ),
      },
    },
    validationOptions
  )
}
