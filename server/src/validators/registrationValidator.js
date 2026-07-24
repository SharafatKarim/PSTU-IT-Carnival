const { body, validationResult } = require('express-validator');

const bdPhoneRegex = /^(?:\+?880)?1[3-9]\d{8}$/;

const tshirtSizes = ['S', 'M', 'L', 'XL', 'XXL'];

const memberRules = (pathPrefix) => [
  body(`${pathPrefix}.name`)
    .trim()
    .notEmpty()
    .withMessage('Member name is required')
    .isLength({ max: 100 })
    .withMessage('Member name cannot exceed 100 characters'),
  body(`${pathPrefix}.email`)
    .trim()
    .notEmpty()
    .withMessage('Member email is required')
    .isEmail()
    .withMessage('Please provide a valid member email')
    .normalizeEmail(),
  body(`${pathPrefix}.phone`)
    .trim()
    .notEmpty()
    .withMessage('Member phone is required')
    .matches(bdPhoneRegex)
    .withMessage('Phone must be a valid Bangladeshi number (e.g. 017XXXXXXXX or +88017XXXXXXXX)'),
  body(`${pathPrefix}.codeforcesHandle`)
    .trim()
    .notEmpty()
    .withMessage('Codeforces handle is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Codeforces handle must be 2-50 characters'),
  body(`${pathPrefix}.tshirtSize`)
    .trim()
    .notEmpty()
    .withMessage('T-shirt size is required')
    .isIn(tshirtSizes)
    .withMessage('T-shirt size must be one of S, M, L, XL, XXL'),
];

const registrationRules = [
  body('teamName')
    .trim()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Team name must be 3-100 characters'),
  body('varsityName')
    .trim()
    .notEmpty()
    .withMessage('Varsity name is required')
    .isLength({ max: 150 })
    .withMessage('Varsity name cannot exceed 150 characters'),

  body('coach.name')
    .trim()
    .notEmpty()
    .withMessage('Coach name is required')
    .isLength({ max: 100 })
    .withMessage('Coach name cannot exceed 100 characters'),
  body('coach.email')
    .trim()
    .notEmpty()
    .withMessage('Coach email is required')
    .isEmail()
    .withMessage('Please provide a valid coach email')
    .normalizeEmail(),
  body('coach.phone')
    .trim()
    .notEmpty()
    .withMessage('Coach phone is required')
    .matches(bdPhoneRegex)
    .withMessage('Coach phone must be a valid Bangladeshi number (e.g. 017XXXXXXXX or +88017XXXXXXXX)'),

  body('members')
    .isArray({ min: 3, max: 3 })
    .withMessage('Exactly 3 team members are required'),

  ...memberRules('members[0]'),
  ...memberRules('members[1]'),
  ...memberRules('members[2]'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formatted = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: formatted,
  });
};

module.exports = {
  registrationRules,
  validate,
  bdPhoneRegex,
  tshirtSizes,
};
