const { success } = require('../utils/response');

const getHealth = (req, res) => {
  return success(res, {
    message: 'PSTU IT Carnival API is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = { getHealth };
