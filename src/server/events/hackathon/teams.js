import Registration from './model';
import { HACKATHON_ACCEPTED_TEAMS } from '@/data/events';

const PUBLIC_FIELDS = 'registrationId teamName finalRegistered shortlisted registrationStatus payment.transactionId members.fullName members.universityName';

export const serialOf = (registrationId) => {
  const match = /(\d+)$/.exec(registrationId || '');
  return match ? Number(match[1]) : null;
};

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (search) => {
  const baseFilter = {
    $or: [
      { shortlisted: true },
      { registrationId: { $in: HACKATHON_ACCEPTED_TEAMS } },
    ],
  };

  if (!search) return baseFilter;

  if (/^\d+$/.test(search)) {
    return {
      $and: [
        baseFilter,
        { registrationId: new RegExp(`-0*${search}$`) },
      ],
    };
  }

  const rx = new RegExp(escapeRe(search), 'i');
  return {
    $and: [
      baseFilter,
      {
        $or: [
          { teamName: rx },
          { registrationId: rx },
          { 'members.fullName': rx },
          { 'members.universityName': rx },
        ],
      },
    ],
  };
};

const LEGACY_STATUS = { pending: 'pre-registered', approved: 'paid' };

const normaliseStatus = (status, finalRegistered) => {
  if (finalRegistered) return 'paid';
  return LEGACY_STATUS[status] || status || 'pre-registered';
};

const toPublicTeam = (doc) => ({
  serial: serialOf(doc.registrationId),
  registrationId: doc.registrationId,
  teamName: doc.teamName,
  status: normaliseStatus(doc.registrationStatus, doc.finalRegistered),
  shortlisted: Boolean(doc.shortlisted || HACKATHON_ACCEPTED_TEAMS.includes(doc.registrationId)),
  members: (doc.members || []).map((m) => `${m.fullName} (${m.universityName})`),
  hasTxId: Boolean(doc.payment?.transactionId),
});

export async function listTeams({ search = '', page = 1, limit = 20 } = {}) {
  const filter = buildFilter(String(search).trim());

  const [total, docs] = await Promise.all([
    Registration.countDocuments(filter),
    Registration.find(filter)
      .select(PUBLIC_FIELDS)
      .sort({ registrationId: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return {
    teams: docs.map(toPublicTeam),
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
