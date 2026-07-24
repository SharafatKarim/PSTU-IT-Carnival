const Registration = require('../models/Registration');
const { generateRegistrationId } = require('../utils/registrationId');
const { success, fail } = require('../utils/response');

const createRegistration = async (req, res, next) => {
  try {
    const { teamName, varsityName, coach, members } = req.body;

    const memberEmails = members.map((m) => m.email.toLowerCase());
    const memberHandles = members.map((m) => m.codeforcesHandle.toLowerCase());

    const duplicateEmails = memberEmails.filter(
      (e, i) => memberEmails.indexOf(e) !== i || e === coach.email.toLowerCase()
    );
    if (duplicateEmails.length > 0) {
      return fail(res, {
        message: 'Member emails must be unique and different from the coach email',
        statusCode: 400,
        errors: [{ field: 'members', message: `Duplicate email(s): ${[...new Set(duplicateEmails)].join(', ')}` }],
      });
    }

    const duplicateHandles = memberHandles.filter(
      (h, i) => memberHandles.indexOf(h) !== i
    );
    if (duplicateHandles.length > 0) {
      return fail(res, {
        message: 'Codeforces handles must be unique across members',
        statusCode: 400,
        errors: [{ field: 'members', message: `Duplicate handle(s): ${[...new Set(duplicateHandles)].join(', ')}` }],
      });
    }

    const existingTeam = await Registration.findOne({ teamName });
    if (existingTeam) {
      return fail(res, {
        message: 'A team with this name is already registered',
        statusCode: 409,
        errors: [{ field: 'teamName', message: 'Team name already exists' }],
      });
    }

    const existingEmails = await Registration.findOne({
      'members.email': { $in: memberEmails },
    });
    if (existingEmails) {
      return fail(res, {
        message: 'One or more member emails are already registered',
        statusCode: 409,
        errors: [{ field: 'members', message: 'A member with this email is already registered' }],
      });
    }

    const existingHandle = await Registration.findOne({
      'members.codeforcesHandle': { $in: memberHandles },
    });
    if (existingHandle) {
      return fail(res, {
        message: 'One or more Codeforces handles are already registered',
        statusCode: 409,
        errors: [{ field: 'members', message: 'A Codeforces handle is already registered' }],
      });
    }

    const registrationId = await generateRegistrationId();

    const created = await Registration.create({
      teamName,
      varsityName,
      coach,
      members,
      registrationId,
    });

    return success(res, {
      message: 'Registration completed successfully',
      statusCode: 201,
      data: { registrationId: created.registrationId },
    });
  } catch (error) {
    if (error && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return fail(res, {
        message: `Duplicate value for ${field}`,
        statusCode: 409,
        errors: [{ field, message: `${field} must be unique` }],
      });
    }
    return next(error);
  }
};

module.exports = { createRegistration };
