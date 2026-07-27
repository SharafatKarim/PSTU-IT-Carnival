// ---------------------------------------------------------------------------
// Gaming registration payload validation.
//
// The browser form is generated from `game.registration.sections` in
// src/data/gaming.js, so the server validates against that same config rather
// than restating the field list. Add a field to the data and both sides pick
// it up — they cannot drift.
//
// Conditional sections are honoured through the same `when(values)` predicate
// the form uses (see visibleSections in src/data/gaming.js), so an individual
// entrant is never rejected for having no squad roster — and, just as
// importantly, a squad entry cannot skip one by lying about its entry type,
// because the predicate is re-evaluated here against what was actually sent.
//
// Unlike src/server/events/iupc/validation.js this is generic: it is driven by
// the game config passed in, not by one tournament's hard-coded shape.
// ---------------------------------------------------------------------------

import { visibleSections } from '@/data/gaming';

/* "players.2.gameId" -> payload.players[2].gameId */
const readPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim().length === 0;

/* A choice field's options are {value,label}; a select's are plain strings. */
const allowedValues = (field) =>
  (field.options || []).map((option) =>
    typeof option === 'string' ? option : option.value
  );

/* Fields marked `unique` must not repeat across the rows of their group —
   the same rule the form enforces client-side for player game IDs. */
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

export function validateGameRegistration(game, body, { hasScreenshot = false } = {}) {
  if (!Array.isArray(game?.registration?.sections)) {
    return [{ field: 'game', message: 'This game does not accept registrations' }];
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return [{ field: 'body', message: 'Registration payload must be an object' }];
  }

  const errors = [];

  /* Which half of the form applies depends on the answers themselves, so the
     entry type is resolved before anything else is checked. */
  const values = {
    entryType: game.registration.entryType || body.entryType,
  };

  visibleSections(game, values)
    .flatMap((section) => section.fields || [])
    .forEach((field) => {
      const value = readPath(body, field.name);

      if (field.type === 'checkbox') {
        if (field.required && value !== true) {
          errors.push({ field: field.name, message: `${field.label} must be accepted` });
        }
        return;
      }

      /* A file never travels inside the JSON payload — it arrives as a
         separate multipart part and the route reports whether it survived
         validation. Without this branch the loop reached the typeof check
         below and rejected every upload with "must be text". */
      if (field.type === 'file') {
        if (field.required && !hasScreenshot) {
          errors.push({ field: field.name, message: `${field.label} is required` });
        }
        return;
      }

      /* "Either this or that" — used by the payment pair, where a transaction
         ID and a screenshot each satisfy the requirement on their own. */
      if (field.requiredUnlessScreenshot && isBlank(value) && !hasScreenshot) {
        errors.push({
          field: field.name,
          message: `${field.label} is required unless you attach a screenshot`,
        });
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

      const min = field.rules?.minLength;
      if (min && trimmed.length < min.value) {
        errors.push({ field: field.name, message: min.message });
      }

      const pattern = field.rules?.pattern;
      if (pattern && !pattern.value.test(trimmed)) {
        errors.push({ field: field.name, message: pattern.message });
      }

      if (field.type === 'select' || field.type === 'choice') {
        const allowed = allowedValues(field);
        if (allowed.length > 0 && !allowed.includes(trimmed)) {
          errors.push({
            field: field.name,
            message: `${field.label} must be one of: ${allowed.join(', ')}`,
          });
        }
      }

      if (field.unique) checkUnique(field, body, errors);
    });

  return errors;
}
