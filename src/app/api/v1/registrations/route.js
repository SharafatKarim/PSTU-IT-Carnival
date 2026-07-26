// ---------------------------------------------------------------------------
// DEPRECATED — kept alive only for links and clients created before the API
// was reorganised per event. The handler itself now lives at
// src/app/api/v1/events/iupc/registrations/route.js.
//
// This is a re-export rather than a redirect on purpose: a 308 would rely on
// the caller replaying its POST body, and pre-registration closes 31 July 2026.
// Delete this file once the carnival is over.
// ---------------------------------------------------------------------------

export { POST } from '@/app/api/v1/events/iupc/registrations/route';
