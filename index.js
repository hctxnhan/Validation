function lodashGet(object, path) {
  return path.split('.').reduce((acc, key) => acc[key], object);
}

function createValidationRule({ validate, message }) {
  return {
    validate,
    message,
    mgs: (newMessage) =>
      createValidationRule({ validate, message: newMessage }),
    not: () =>
      createValidationRule({ validate: (args) => !validate(args), message })
  };
}

const Validate = {
  STRING: {
    type: createValidationRule({
      validate: ({ currentValue }) => typeof currentValue === 'string',
      message: '{field_key} must be a string'
    }),
    isAlphaNumeric: createValidationRule({
      validate: ({ currentValue }) => /^[a-zA-Z0-9]*$/.test(currentValue),
      message: '{field_key} must be alphanumeric'
    }),
    isNumeric: createValidationRule({
      validate: ({ currentValue }) => /^[0-9]*$/.test(currentValue),
      message: '{field_key} must be numeric'
    }),
    isAlpha: createValidationRule({
      validate: ({ currentValue }) => /^[a-zA-Z]*$/.test(currentValue),
      message: '{field_key} must be alphabetic'
    }),
    isContain: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue.includes(value),
        message: '{field_key} must contain {value}'
      }),
    isRequired: createValidationRule({
      validate: ({ currentValue }) => currentValue !== '',
      message: '{field_key} is required'
    }),
    isEmpty: createValidationRule({
      validate: ({ currentValue }) => currentValue === '',
      message: '{field_key} must be empty'
    }),
    isEmail: createValidationRule({
      validate: ({ currentValue }) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue),
      message: '{field_key} must be an email'
    }),
    isUrl: createValidationRule({
      validate: ({ currentValue }) =>
        /^(http|https):\/\/[^ "]+$/.test(currentValue),
      message: '{field_key} must be a URL'
    }),
    minLength: (length) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue.length >= length,
        message: '{field_key} must be at least {value} characters'
      }),
    maxLength: (length) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue.length <= length,
        message: '{field_key} must be at most {value} characters'
      }),
    isPattern: (pattern) =>
      createValidationRule({
        validate: ({ currentValue }) => pattern.test(currentValue),
        message: '{field_key} must match the pattern'
      })
  },
  NUMBER: {
    type: createValidationRule({
      validate: ({ currentValue }) => typeof currentValue === 'number',
      message: '{field_key} must be a number'
    }),
    isRequired: createValidationRule({
      validate: ({ currentValue }) =>
        currentValue !== null && currentValue !== undefined,
      message: '{field_key} is required'
    }),
    isInteger: createValidationRule({
      validate: ({ currentValue }) => Number.isInteger(currentValue),
      message: '{field_key} must be an integer'
    }),
    isPositive: createValidationRule({
      validate: ({ currentValue }) => currentValue > 0,
      message: '{field_key} must be positive'
    }),
    isNegative: createValidationRule({
      validate: ({ currentValue }) => currentValue < 0,
      message: '{field_key} must be negative'
    }),
    minValue: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue >= value,
        message: `{field_key} must be at least ${value}, but got {value}`
      }),
    maxValue: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue <= value,
        message: `{field_key} must be at most ${value}, but got {value}`
      }),
    between: (min, max) =>
      createValidationRule({
        validate: ({ currentValue }) =>
          currentValue >= min && currentValue <= max,
        message: `{field_key} must be between ${min} and ${max}, but got {value}`
      }),
    lt: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue < value,
        message: `{field_key} must be less than ${value}`
      }),
    gt: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue > value,
        message: `{field_key} must be greater than ${value}`
      }),
    lte: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue <= value,
        message: `{field_key} must be less than or equal to ${value}`
      }),
    gte: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue >= value,
        message: `{field_key} must be greater than or equal to ${value}`
      })
  },
  OBJECT: {
    type: createValidationRule({
      validate: ({ currentValue }) => typeof currentValue === 'object',
      message: '{field_key} must be an object'
    }),
    isRequired: createValidationRule({
      validate: ({ currentValue }) =>
        currentValue !== null && currentValue !== undefined,
      message: '{field_key} is required'
    }),
    isEmpty: createValidationRule({
      validate: ({ currentValue }) => Object.keys(currentValue).length === 0,
      message: '{field_key} must be empty'
    })
  },
  ARRAY: {
    type: createValidationRule({
      validate: ({ currentValue }) => Array.isArray(currentValue),
      message: '{field_key} must be an array'
    }),
    isRequired: createValidationRule({
      validate: ({ currentValue }) =>
        currentValue !== null && currentValue !== undefined,
      message: '{field_key} is required'
    }),
    isEmpty: createValidationRule({
      validate: ({ currentValue }) => currentValue.length === 0,
      message: '{field_key} must be empty'
    }),
    minLength: (length) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue.length >= length,
        message: '{field_key} must have at least {value} items'
      }),
    maxLength: (length) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue.length <= length,
        message: '{field_key} must have at most {value} items'
      }),
    isUnique: createValidationRule({
      validate: ({ currentValue }) =>
        new Set(currentValue).size === currentValue.length,
      message: '{field_key} must have unique items'
    }),
    isContain: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue.includes(value),
        message: '{field_key} must contain {value}'
      })
  },
  ENUM: {
    oneOf: (values) =>
      createValidationRule({
        validate: ({ currentValue }) =>
          Array.isArray(currentValue)
            ? currentValue.every((value) => values.includes(value))
            : values.includes(currentValue),
        message: `{field_key} must be one of ${values.join(', ')}`
      })
  },
  BOOLEAN: {
    type: createValidationRule({
      validate: ({ currentValue }) => typeof currentValue === 'boolean',
      message: '{field_key} must be a boolean'
    }),
    isRequired: createValidationRule({
      validate: ({ currentValue }) =>
        currentValue !== null && currentValue !== undefined,
      message: '{field_key} is required'
    }),
    isTrue: createValidationRule({
      validate: ({ currentValue }) => currentValue === true,
      message: '{field_key} must be true'
    }),
    isFalse: createValidationRule({
      validate: ({ currentValue }) => currentValue === false,
      message: '{field_key} must be false'
    }),
    isTruthy: createValidationRule({
      validate: ({ currentValue }) => !!currentValue,
      message: '{field_key} must be truthy'
    }),
    isFalsy: createValidationRule({
      validate: ({ currentValue }) => !currentValue,
      message: '{field_key} must be falsy'
    }),
    isNot: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue !== value,
        message: '{field_key} must not be {value}'
      })
  },
  DATE: {
    type: createValidationRule({
      validate: ({ currentValue }) => currentValue instanceof Date,
      message: '{field_key} must be a date'
    }),
    isRequired: createValidationRule({
      validate: ({ currentValue }) =>
        currentValue !== null && currentValue !== undefined,
      message: '{field_key} is required'
    }),
    isBefore: (date) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue < date,
        message: '{field_key} must be before {value}'
      }),
    isAfter: (date) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue > date,
        message: '{field_key} must be after {value}'
      }),
    isBetween: (startDate, endDate) =>
      createValidationRule({
        validate: ({ currentValue }) =>
          currentValue > startDate && currentValue < endDate,
        message: '{field_key} must be between {value} and {value}'
      }),
    isPast: createValidationRule({
      validate: ({ currentValue }) => currentValue < new Date(),
      message: '{field_key} must be in the past'
    }),
    isFuture: createValidationRule({
      validate: ({ currentValue }) => currentValue > new Date(),
      message: '{field_key} must be in the future'
    })
  },
  AGGREGATE: {
    all: (rules) =>
      createValidationRule({
        validate: ({ currentValue, wholeDataObject }) =>
          rules.every((rule) =>
            rule.validate({ currentValue, wholeDataObject })
          ),
        message: rules.map((rule) => rule.message).join(', ')
      }),
    any: (rules) =>
      createValidationRule({
        validate: ({ currentValue, wholeDataObject }) =>
          rules.some((rule) =>
            rule.validate({ currentValue, wholeDataObject })
          ),
        message: rules.map((rule) => rule.message).join(', ')
      })
  },
  COMMON: {
    strictEqual: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue === value,
        message: `{field_key} must be equal to ${value}`
      }),
    coerceEqual: (value) =>
      createValidationRule({
        validate: ({ currentValue }) => currentValue == value,
        message: `{field_key} must be equal to ${value}`
      }),
    isEmpty: createValidationRule({
      validate: ({ currentValue }) =>
        currentValue === '' ||
        currentValue === null ||
        currentValue === undefined,
      message: '{field_key} must be empty'
    }),
    isNull: createValidationRule({
      validate: ({ currentValue }) => currentValue === null,
      message: '{field_key} must be null'
    }),
    isUndefined: createValidationRule({
      validate: ({ currentValue }) => currentValue === undefined,
      message: '{field_key} must be undefined'
    })
  },
  CUSTOM: (validate, message) =>
    createValidationRule({
      validate,
      message
    }),
  $OTHER: (path, rule) =>
    createValidationRule({
      validate: ({ wholeDataObject }) =>
        rule.validate({ currentValue: lodashGet(wholeDataObject, path) }),
      message: rule.message
    })
};

const exampleSchema = (data) => ({
  name: [
    {
      validate: [
        Validate.STRING.isRequired,
        Validate.STRING.type,
        Validate.STRING.minLength(3),
        Validate.STRING.maxLength(20)
      ]
    }
  ],
  age: [
    {
      validate: [
        Validate.NUMBER.isRequired,
        Validate.NUMBER.type,
        Validate.NUMBER.minValue(18)
      ]
    }
  ],
  birthDate: [
    {
      validate: [
        Validate.DATE.isRequired,
        Validate.DATE.type,
        Validate.DATE.isPast
      ]
    }
  ],
  isMale: [{ validate: [Validate.BOOLEAN.isRequired, Validate.BOOLEAN.type] }],
  idNumber: [
    {
      validate: [
        Validate.STRING.type,
        Validate.STRING.isPattern(/^[0-9]{10}$/)
      ],
      when: [Validate.$OTHER('age', Validate.NUMBER.minValue(18))]
    },
    {
      validate: [Validate.STRING.isEmpty],
      whenNot: [Validate.$OTHER('age', Validate.NUMBER.minValue(18))]
    }
  ],
  email: [
    {
      validate: [
        Validate.STRING.isRequired,
        Validate.STRING.type,
        Validate.STRING.isEmail
      ]
    }
  ],
  url: [{ validate: [Validate.STRING.type, Validate.STRING.isUrl] }],
  assets: {
    $beforeAllWhen: [Validate.$OTHER('age', Validate.NUMBER.minValue(18))],
    cars: [
      {
        validate: [
          Validate.ARRAY.isRequired,
          Validate.ARRAY.type,
          Validate.ARRAY.minLength(1),
          Validate.ENUM.oneOf(['toyota', 'honda', 'ford'])
        ]
      }
    ],
    carTax: [
      {
        validate: [
          Validate.NUMBER.isRequired,
          Validate.NUMBER.type,
          Validate.NUMBER.minValue(100),
          Validate.NUMBER.isInteger,
          Validate.NUMBER.isPositive
        ],
        when: [
          Validate.$OTHER(
            'assets.cars',
            Validate.ARRAY.type,
            Validate.ARRAY.minLength(1)
          )
        ]
      }
    ],
    max: [
      {
        validate: [
          Validate.NUMBER.isRequired,
          Validate.NUMBER.type,
          Validate.NUMBER.isInteger,
          Validate.NUMBER.isPositive
        ],
        when: [Validate.$OTHER('assets.min', Validate.NUMBER.type)]
      }
    ],
    min: [
      {
        validate: [
          Validate.NUMBER.isRequired,
          Validate.NUMBER.type,
          Validate.NUMBER.minValue(0),
          Validate.NUMBER.maxValue(lodashGet(data, 'assets.max')).mgs(
            'Can not be more than max'
          ),
          Validate.NUMBER.isInteger,
          Validate.NUMBER.isPositive
        ],
        when: [Validate.$OTHER('assets.max', Validate.NUMBER.type)]
      }
    ]
  },
  numOfFollowers: [
    {
      $beforeAllWhen: Validate.$OTHER(
        'url',
        Validate.STRING.type,
        Validate.STRING.isUrl
      )
    },
    {
      validate: [
        Validate.NUMBER.isRequired,
        Validate.NUMBER.type,
        Validate.NUMBER.between(10000, 500000)
      ],
      when: [Validate.$OTHER('age', Validate.NUMBER.minValue(18))]
    },
    {
      validate: [
        Validate.NUMBER.isRequired,
        Validate.NUMBER.type,
        Validate.NUMBER.between(5000, 10000)
      ],
      when: [Validate.$OTHER('age', Validate.NUMBER.maxValue(17))]
    }
  ],
  $refine: [
    {
      validate: [
        Validate.AGGREGATE.all([
          Validate.$OTHER('age', Validate.NUMBER.lt(18)),
          Validate.$OTHER('idNumber', Validate.STRING.isEmpty)
        ]).mgs('idNumber cant be specified for under 18')
      ],
      path: ['idNumber']
    }
  ]
});

function validate(schemaFn, data, fullData) {
  const errors = {};

  const schema = typeof schemaFn === 'function' ? schemaFn(data) : schemaFn;

  // loop through each property in the schema
  // if schema[key] is an array, then loop through each item in array
  // if the item in that array have a '$beforeAll' then run that rule first to check if the following rules in the array should be run, if not then skip the rest of the rules

  // if schema[key] is an object, then recursively call the validate function with the object and data[key]
  // if key is '$beforeAll' then run the rule first to check if the following property (nested property) should be run

  function formatMessage(message, key, value) {
    return message.replace('{field_key}', key).replace('{value}', value);
  }

  function validateRules(
    rules,
    currentValue,
    wholeDataObject,
    defaultResult = true
  ) {
    if (!rules) {
      return defaultResult;
    }

    // else for each rule in the array, run the rule, and return message string if the rule is not valid

    for (const rule of rules) {
      const isValid = rule.validate({ currentValue, wholeDataObject });
      if (!isValid) {
        return rule.message;
      }
    }

    return true;
  }

  for (const key in schema) {
    if (key === '$beforeAllWhen') {
      const isValid = validateRules(schema[key], data, fullData);
      if (typeof isValid === 'string') {
        break;
      }

      continue;
    }

    if (Array.isArray(schema[key])) {
      for (const rule of schema[key]) {
        const currentValue = lodashGet(data, key);
        const shouldRun = validateRules(rule.when, currentValue, fullData);

        const shouldNotRun = validateRules(
          rule.whenNot,
          currentValue,
          fullData,
          false
        );

        if (typeof shouldRun === 'string' || shouldNotRun === true) {
          continue;
        }

        const proceedRun =
          shouldRun && (!shouldNotRun || typeof shouldNotRun === 'string');

        if (proceedRun) {
          const isValid = validateRules(rule.validate, currentValue, fullData);
          if (typeof isValid === 'string') {
            const keyInErrors = rule.path ? rule.path : key;
            errors[keyInErrors] = formatMessage(isValid, key, currentValue);
          }
        }
      }
    } else if (typeof schema[key] === 'object') {
      const nestedErrors = validate(schema[key], data[key], fullData);
      if (Object.keys(nestedErrors).length > 0) {
        errors[key] = nestedErrors;
      }
    }
  }

  return errors;
}

// const data = {
//   name: 'John Doe',
//   age: 16,
//   birthDate: new Date('1990-01-01'),
//   isMale: true,
//   idNumber: '1234567890',
//   email: '@gmail.com',
//   url: 'https://google.com',
//   assets: {
//     cars: ['toyota', 'honda'],
//     carTax: 200,
//     max: 100,
//     min: 200
//   },
//   numOfFollowers: 10000
// };

Validation.validate = validate;
Validation.exampleSchema = exampleSchema;

return Validation;
