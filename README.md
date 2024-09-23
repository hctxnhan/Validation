# Validation Library

This JavaScript validation library allows you to easily define and apply validation rules to various data types, including strings, numbers, arrays, objects, and more. It supports custom validation rules and enables complex schema definitions with conditional validation logic.

## Features

- Built-in validators for common data types (string, number, array, object, date, etc.).
- Supports conditional validation with `when` and `whenNot`.
- Ability to create custom validation rules.
- Support for aggregate validation (`all`, `any`).
- Negation of rules using `.not()` method.
- Dynamic error messages with placeholders.

## Installation

To use this library, import it into your project:

```html 
<script  src="https://cdn.jsdelivr.net/gh/hctxnhan/Validation/dist/validation.umd.min.js"></script>
```

## Basic Usage

### Defining a Schema

A schema defines validation rules for the fields in your data. Each field can have one or more validation rules.

Here's an example schema demonstrating various rules:
- `data`: is the data of the whole object which is being validated in real time.

```javascript
const exampleSchema = (data) => ({
  name: [
    {
      validate: [
        validation.STRING.isRequired,
        validation.STRING.type,
        validation.STRING.minLength(3),
        validation.STRING.maxLength(20),
      ],
    },
  ],
  age: [
    {
      validate: [
        validation.NUMBER.isRequired,
        validation.NUMBER.type,
        validation.NUMBER.minValue(18),
      ],
    },
  ],
  birthDate: [
    {
      validate: [
        validation.DATE.isRequired,
        validation.DATE.type,
        validation.DATE.isPast,
      ],
    },
  ],
  isMale: [{ validate: [validation.BOOLEAN.isRequired, validation.BOOLEAN.type] }],
  idNumber: [
    {
      validate: [
        validation.STRING.type,
        validation.STRING.isPattern(/^[0-9]{10}$/),
      ],
      when: [validation.$OTHER("age", validation.NUMBER.minValue(18))],
    },
    {
      validate: [validation.STRING.isEmpty],
      whenNot: [validation.$OTHER("age", validation.NUMBER.minValue(18))],
    },
  ],
  email: [
    {
      validate: [
        validation.STRING.isRequired,
        validation.STRING.type,
        validation.STRING.isEmail,
      ],
    },
  ],
  url: [{ validate: [validation.STRING.type, validation.STRING.isUrl] }],
  assets: {
    $beforeAllWhen: [validation.$OTHER("age", validation.NUMBER.minValue(18))],
    cars: [
      {
        validate: [
          validation.ARRAY.isRequired,
          validation.ARRAY.type,
          validation.ARRAY.minLength(1),
          validation.ENUM.oneOf(["toyota", "honda", "ford"]),
        ],
      },
    ],
    carTax: [
      {
        validate: [
          validation.NUMBER.isRequired,
          validation.NUMBER.type,
          validation.NUMBER.minValue(100),
          validation.NUMBER.isInteger,
          validation.NUMBER.isPositive,
        ],
        when: [
          validation.$OTHER(
            "assets.cars",
            validation.ARRAY.type,
            validation.ARRAY.minLength(1),
          ),
        ],
      },
    ],
    max: [
      {
        validate: [
          validation.NUMBER.isRequired,
          validation.NUMBER.type,
          validation.NUMBER.isInteger,
          validation.NUMBER.isPositive,
        ],
        when: [validation.$OTHER("assets.min", validation.NUMBER.type)],
      },
    ],
    min: [
      {
        validate: [
          validation.NUMBER.isRequired,
          validation.NUMBER.type,
          validation.NUMBER.minValue(0),
          validation.NUMBER.maxValue(lodashGet(data, "assets.max")).mgs(
            "Can not be more than max",
          ),
          validation.NUMBER.isInteger,
          validation.NUMBER.isPositive,
        ],
        when: [validation.$OTHER("assets.max", validation.NUMBER.type)],
      },
    ],
  },
  numOfFollowers: [
    {
      $beforeAllWhen: validation.$OTHER(
        "url",
        validation.STRING.type,
        validation.STRING.isUrl,
      ),
    },
    {
      validate: [
        validation.NUMBER.isRequired,
        validation.NUMBER.type,
        validation.NUMBER.between(10000, 500000),
      ],
      when: [validation.$OTHER("age", validation.NUMBER.minValue(18))],
    },
    {
      validate: [
        validation.NUMBER.isRequired,
        validation.NUMBER.type,
        validation.NUMBER.between(5000, 10000),
      ],
      when: [validation.$OTHER("age", validation.NUMBER.maxValue(17))],
    },
  ],
  $refine: [
    {
      validate: [
        validation.AGGREGATE.all([
          validation.$OTHER("age", validation.NUMBER.lt(18)),
          validation.$OTHER("idNumber", validation.STRING.isEmpty),
        ]).mgs("idNumber cant be specified for under 18"),
      ],
      path: ["idNumber"],
    },
  ],
});
```

### Validating Data
#### API `validate(schemaFn, data, fullData)`

Validates the provided `data` against the defined `schema`.

- **schemaFn**: A schema function that returns the validation rules.
- **data**: The data to be validated.

Returns an object containing validation errors.

#### Example
```javascript
const data = {
  name: 'John',
  age: 25,
  email: 'john.doe@example.com'
};

const errors = Validation.validate(schema, data);

if (Object.keys(errors).length === 0) {
  console.log('Validation passed');
} else {
  console.log('Validation failed', errors);
}
```

## Validation Rules

### String Rules

- **type**: Must be a string.
- **isAlpha**: Must contain only alphabetic characters (A-Z, a-z).
- **isAlphaNumeric**: Must contain only alphanumeric characters (A-Z, a-z, 0-9).
- **isNumeric**: Must contain only numeric characters (0-9).
- **isEmail**: Must be a valid email address.
- **isUrl**: Must be a valid URL.
- **isRequired**: The field is required (non-empty string).
- **isEmpty**: Must be empty.
- **minLength(length)**: Must be at least `length` characters.
- **maxLength(length)**: Must be at most `length` characters.
- **isPattern(pattern)**: Must match the provided regular expression `pattern`.
- **isContain(value)**: Must contain the specified substring `value`.

### Number Rules

- **type**: Must be a number.
- **isRequired**: The field is required (non-null and non-undefined).
- **isInteger**: Must be an integer.
- **isPositive**: Must be greater than 0.
- **isNegative**: Must be less than 0.
- **minValue(value)**: Must be greater than or equal to `value`.
- **maxValue(value)**: Must be less than or equal to `value`.
- **between(min, max)**: Must be between `min` and `max` values.
- **lt(value)**: Must be less than `value`.
- **gt(value)**: Must be greater than `value`.
- **lte(value)**: Must be less than or equal to `value`.
- **gte(value)**: Must be greater than or equal to `value`.

### Object Rules

- **type**: Must be an object.
- **isRequired**: The field is required (non-null and non-undefined).
- **isEmpty**: Must be an empty object.

### Array Rules

- **type**: Must be an array.
- **isRequired**: The field is required (non-null and non-undefined).
- **isEmpty**: Must be an empty array.
- **minLength(length)**: Must have at least `length` items.
- **maxLength(length)**: Must have at most `length` items.
- **isUnique**: All items must be unique.
- **isContain(value)**: Must contain the specified item `value`.

### Boolean Rules

- **type**: Must be a boolean.
- **isRequired**: The field is required (non-null and non-undefined).
- **isTrue**: Must be `true`.
- **isFalse**: Must be `false`.
- **isTruthy**: Must be a truthy value.
- **isFalsy**: Must be a falsy value.
- **isNot(value)**: Must not be equal to the specified value `value`.

### Date Rules

- **type**: Must be a `Date` object.
- **isRequired**: The field is required (non-null and non-undefined).
- **isBefore(date)**: Must be before the specified date.
- **isAfter(date)**: Must be after the specified date.
- **isBetween(startDate, endDate)**: Must be between the specified dates.
- **isPast**: Must be in the past.
- **isFuture**: Must be in the future.

### Common

- **strictEqual(value)**: Must be strictly equal to the provided value.
- **coerceEqual(value)**: Must be loosely equal to the provided value (using `==`).
- **isEmpty**: Must be empty (null, undefined, or empty string).
- **isNull**: Must be `null`.
- **isUndefined**: Must be `undefined`.

### Negating Rules: `.not()`

You can use `.not()` to invert any rule. For example:

```javascript
const schema = {
  username: [{ validate: [Validation.STRING.isEmpty.not()] }],
  age: [{ validate: [Validation.NUMBER.isNegative.not()] }]
};
```

### Aggregate Rules

- **all(rules)**: All the rules must pass.
- **any(rules)**: At least one rule must pass.

### Conditional Rules: `when` and `whenNot`

You can conditionally apply validation rules using `when` and `whenNot`. For example:

```javascript
const schema = {
  idNumber: [
    {
      validate: [Validation.STRING.type, Validation.STRING.isPattern(/^[0-9]{10}$/)],
      when: [Validation.$OTHER('age', Validation.NUMBER.minValue(18))]
    },
    {
      validate: [Validation.STRING.isEmpty],
      whenNot: [Validation.$OTHER('age', Validation.NUMBER.minValue(18))]
    }
  ]
};
```
### Centralized Validation with `$refine`

The `$refine` method allows you to define validation rules that are not specific to any individual field but still able to reference specific paths to display errors. This is useful for creating cross-field validations or rules that apply to the overall data structure.

This `$refine` example validates that the `idNumber` field should not be specified if the `age` is less than 18. If this rule is violated, the error message will be attached to the `idNumber` field.

If `path` is omitted, then the error is attached to `$refine` property itself in returned errors object.

```javascript
$refine: [
  {
    validate: [
      validation.AGGREGATE.all([
        validation.$OTHER("age", validation.NUMBER.lt(18)),
        validation.$OTHER("idNumber", validation.STRING.isEmpty),
      ]).mgs("idNumber cant be specified for under 18"),
    ],
    path: ["idNumber"],
  },
];
```

## Custom Validation

You can create custom validation rules using `Validation.CUSTOM(validateFn, message)`.

```javascript
const customRule = Validation.CUSTOM(
  ({ currentValue }) => currentValue.startsWith('ABC'),
  '{field_key} must start with "ABC"'
);
```

This README provides a comprehensive guide to using the validation library, covering installation, usage, available rules, conditional validation, custom rules, negation, and an example schema.
