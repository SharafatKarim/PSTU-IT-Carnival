import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '../../lib/routes';

/* The IUPC form moved under its event (/events/iupc/register). This keeps
   every link that was shared while it lived at /register working. */
export default function LegacyRegisterPage() {
  permanentRedirect(ROUTES.register);
}
