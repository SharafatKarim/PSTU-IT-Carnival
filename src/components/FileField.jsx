'use client';

import { useRef, useState } from 'react';
import { downscaleImage } from '@/lib/downscale';
import { ACCEPT_ATTR, ACCEPTED_LABEL } from '@/lib/upload';

// ---------------------------------------------------------------------------
// The screenshot picker. The first file input on the site.
//
// It is a controlled component rather than a react-hook-form `register`,
// because the file that gets submitted is not the file that was picked: it is
// shrunk in the browser first, and the parent needs the shrunk one. `onChange`
// hands the parent a File or null.
//
// A native <input type="file"> cannot be styled, so the real input is visually
// hidden and a labelled button drives it. It is still a real input — keyboard
// focus, the file dialog and form reset all work, and the label is a real
// <label for>, so a screen reader announces it correctly.
// ---------------------------------------------------------------------------

const bytesLabel = (n) =>
  n >= 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;

const FileField = ({
  label,
  name,
  onChange,
  error,
  required = false,
  hint = `Screenshot of the payment confirmation — ${ACCEPTED_LABEL}.`,
}) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  const handlePick = async (event) => {
    const picked = event.target.files?.[0] || null;

    if (!picked) {
      setFile(null);
      setPreview(null);
      onChange(null);
      return;
    }

    setBusy(true);
    /* Shrunk before it leaves the phone — see lib/downscale.js. Returns the
       original if it cannot help, so this never blocks a submission. */
    const shrunk = await downscaleImage(picked);
    setBusy(false);

    setFile(shrunk);
    setPreview(URL.createObjectURL(shrunk));
    onChange(shrunk);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = '';
    setFile(null);
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-mist-200">
        {label}
        {required && <span className="text-magenta-400"> *</span>}
      </label>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handlePick}
        className="sr-only"
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-ink-500 bg-ink-900/60 p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- a blob: URL
              from the file the user just picked; next/image cannot take one. */}
          <img
            src={preview}
            alt=""
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-white">{file.name}</span>
            <span className="block text-xs text-mist-400 tabular-nums">
              {bytesLabel(file.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 rounded-lg border border-ink-500 px-3 py-1.5 text-xs font-semibold text-mist-200 transition hover:bg-white/5 hover:text-white"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={name}
          className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-3 py-4 text-sm transition ${
            error
              ? 'border-red-500/50 text-red-400'
              : 'border-ink-500 text-mist-300 hover:border-grape-500 hover:text-white'
          }`}
        >
          {busy ? 'Preparing…' : 'Choose a screenshot'}
        </label>
      )}

      {error ? (
        <p className="text-xs text-red-400">{error.message || error}</p>
      ) : (
        hint && <p className="text-xs text-mist-500">{hint}</p>
      )}
    </div>
  );
};

export default FileField;
