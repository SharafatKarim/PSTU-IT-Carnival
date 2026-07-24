const express = require('express');
const { createRegistration } = require('../controllers/registrationController');
const { registrationRules, validate } = require('../validators/registrationValidator');

const router = express.Router();

router.post('/', registrationRules, validate, createRegistration);

module.exports = router;
