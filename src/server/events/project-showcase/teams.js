import Registration from './model';

const PUBLIC_FIELDS = 'registrationId teamName paid members.name members.universityName';

export const serialOf = (registrationId) => {
  const match = /(\d+)$/.exec(registrationId || '');
  return match ? Number(match[1]) : null;
};

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildFilter = (search) => {
  if (!search) return {};

  if (/^\d+$/.test(search)) {
    return { registrationId: new RegExp(`-0*${search}$`) };
  }

  const rx = new RegExp(escapeRe(search), 'i');
  return {
    $or: [
      { teamName: rx },
      { registrationId: rx },
      { 'members.name': rx },
      { 'members.universityName': rx },
    ],
  };
};

const toPublicTeam = (doc) => ({
  serial: serialOf(doc.registrationId),
  registrationId: doc.registrationId,
  teamName: doc.teamName,
  status: doc.paid ? 'paid' : 'pre-registered',
  members: (doc.members || []).map((m) => `${m.name} (${m.universityName})`),
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
