import Registration from '../models/Registration';

const PREFIX = 'PSTU-IUPC-2026';

export async function generateRegistrationId() {
  const count = await Registration.countDocuments();
  const next = String(count + 1).padStart(4, '0');
  return `${PREFIX}-${next}`;
}
