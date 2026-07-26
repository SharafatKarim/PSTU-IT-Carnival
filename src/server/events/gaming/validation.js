// ---------------------------------------------------------------------------
// Gaming registration payload validation.
//
// The browser form is generated from `game.registration.sections` in
// src/data/gaming.js, so the server validates against that same config rather
// than restating the field list. Add a field to the data and both sides pick
// it up — they cannot drift.
//
// Unlike src/server/events/iupc/validation.js this is generic: it is driven by
// the game config passed in, not by one tournament's hard-coded shape.
// ---------------------------------------------------------------------------

/* "players.2.uid" -> payload.players[2].uid */
const readPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim().length === 0;

/* Fields marked `unique` must not repeat across the rows of their group —
   the same rule the form enforces client-side for IGNs and player UIDs. */
const checkUnique = (field, body, errors) => {
  const match = /^(.+)\.(\d+)\.(.+)$/.exec(field.name);
  if (!match) return;

  const [, group, indexStr, key] = match;
  const index = Number(indexStr);
  const rows = readPath(body, group);
  if (!Array.isArray(rows)) return;

  const value = String(rows[index]?.[key] ?? '').trim().toLowerCase();
  if (!value) return;

  const clash = rows.some(
    (row, i) => i !== index && String(row?.[key] ?? '').trim().toLowerCase() === value
  );
  if (clash) {
    errors.push({
      field: field.name,
      message: `${field.label} must be different for each player`,
    });
  }
};

export function validateGameRegistration(game, body) {
  const sections = game?.registration?.sections;
  if (!Array.isArray(sections)) {
    return [{ field: 'game', message: 'This game does not accept registrations' }];
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [{ field: 'body', message: 'Registration payload must be an object' }];
  }

  const errors = [];

  sections
    .flatMap((section) => section.fields)
    .forEach((field) => {
      const value = readPath(body, field.name);

      if (field.type === 'checkbox') {
        if (field.required && value !== true) {
          errors.push({ field: field.name, message: `${field.label} must be accepted` });
        }
        return;
      }

      if (isBlank(value)) {
        // An optional field left blank is valid and has nothing left to check.
        if (field.required) {
          errors.push({ field: field.name, message: `${field.label} is required` });
        }
        return;
      }

      if (typeof value !== 'string') {
        errors.push({ field: field.name, message: `${field.label} must be text` });
        return;
      }

      const trimmed = value.trim();

      const max = field.rules?.maxLength;
      if (max && trimmed.length > max.value) {
        errors.push({ field: field.name, message: max.message });
      }

      const pattern = field.rules?.pattern;
      if (pattern && !pattern.value.test(trimmed)) {
        errors.push({ field: field.name, message: pattern.message });
      }

      if (field.type === 'select' && Array.isArray(field.options)) {
        if (!field.options.includes(trimmed)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be one of: ${field.options.join(', ')}`,
          });
        }
      }

      if (field.unique) checkUnique(field, body, errors);
    });

  return errors;
}
