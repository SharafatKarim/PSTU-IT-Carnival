const Registration = require('../models/Registration');

const PREFIX = process.env.REGISTRATION_ID_PREFIX || 'PSTU-PC-2026';

const generateRegistrationId = async () => {
  const count = await Registration.countDocuments();
  const next = String(count + 1).padStart(4, '0');
  return `${PREFIX}-${next}`;
};

module.exports = { generateRegistrationId };
