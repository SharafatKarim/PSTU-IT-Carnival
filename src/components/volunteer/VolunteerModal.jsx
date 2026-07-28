'use client';

import { useState, useEffect } from 'react';
import { CloseIcon, CheckIcon, AlertIcon } from '@/components/landing/Icons';
import { EVENTS } from '@/data/content';

const ALL_EVENTS = EVENTS.map((e) => e.name);

const T_SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function VolunteerModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    tShirtSize: 'M',
    events: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setError('');
      setSuccessData(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleEvent = (eventName) => {
    setFormData((prev) => {
      const exists = prev.events.includes(eventName);
      return {
        ...prev,
        events: exists
          ? prev.events.filter((e) => e !== eventName)
          : [...prev.events, eventName],
      };
    });
  };

  const handleSelectAllEvents = () => {
    setFormData((prev) => ({ ...prev, events: [...ALL_EVENTS] }));
  };

  const handleClearEvents = () => {
    setFormData((prev) => ({ ...prev, events: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.studentId.trim()) {
      setError('Please enter your Student ID.');
      return;
    }
    if (!formData.email.trim() || !formData.email.trim().toLowerCase().endsWith('@cse.pstu.ac.bd')) {
      setError('We only allow PSTU CSE students as volunteer.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (formData.events.length === 0) {
      setError('Please select at least one event you wish to volunteer for.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessData(data.data);
      } else {
        setError(data.message || 'Failed to submit volunteer registration.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-ink-900 shadow-glow-grape p-6 sm:p-8 text-white my-8">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 rounded-lg p-2 text-mist-400 hover:bg-white/10 hover:text-white transition"
          aria-label="Close modal"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {successData ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400/10 border border-gold-400/40 text-gold-400 mb-4">
              <CheckIcon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Registration Successful!</h3>
            <p className="mt-2 text-sm text-mist-300">
              Thank you for registering as a volunteer for PSTU IT Carnival 2026.
            </p>

            <div className="mt-6 rounded-xl border border-gold-400/30 bg-ink-950/60 p-5 max-w-md mx-auto text-left">
              <p className="text-xs uppercase font-bold tracking-widest text-gold-400">
                Volunteer Registration ID
              </p>
              <p className="text-2xl font-black text-white mt-1 tabular-nums">
                {successData.registrationId}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-mist-300 space-y-1">
                <p>
                  <span className="text-mist-400">Name:</span> {successData.fullName}
                </p>
                <p>
                  <span className="text-mist-400">Assigned Events ({successData.events.length}):</span>{' '}
                  {successData.events.join(', ')}
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-mist-400">
              Please save your Registration ID. The event management team will contact you soon.
            </p>

            <button
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-glow-gold hover:bg-gold-300 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="border-b border-white/10 pb-4 mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-aqua-400/40 bg-aqua-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-aqua-300">
                PSTU IT Carnival 2026
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2">
                Register as Volunteer
              </h2>
              <p className="text-sm text-mist-300 mt-1">
                Join the organizer team! Fill in your information and select which events you wish to support.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                <AlertIcon className="w-5 h-5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist-300 mb-1.5">
                    Full Name <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-4 py-2.5 text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist-300 mb-1.5">
                    Student ID <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-4 py-2.5 text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-mist-300 mb-1.5">
                  Email Address (Edu Mail) <span className="text-gold-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-4 py-2.5 text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                />
                <p className="mt-1.5 text-[11px] text-mist-400">
                  Please insert your official PSTU CSE student edu mail (e.g. studentId@cse.pstu.ac.bd).
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist-300 mb-1.5">
                    Phone / WhatsApp <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-4 py-2.5 text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist-300 mb-1.5">
                    T-Shirt Size
                  </label>
                  <select
                    value={formData.tShirtSize}
                    onChange={(e) => setFormData({ ...formData, tShirtSize: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-4 py-2.5 text-sm text-white focus:border-gold-400 focus:outline-none focus:ring-1 focus:ring-gold-400"
                  >
                    {T_SHIRT_SIZES.map((size) => (
                      <option key={size} value={size} className="bg-ink-900 text-white">
                        Size: {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-mist-300">
                    Select Events to Volunteer For <span className="text-gold-400">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllEvents}
                      className="text-aqua-300 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-mist-400">•</span>
                    <button
                      type="button"
                      onClick={handleClearEvents}
                      className="text-mist-400 hover:text-white hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 border border-white/10 rounded-xl bg-ink-950/40">
                  {ALL_EVENTS.map((eventName) => {
                    const selected = formData.events.includes(eventName);
                    return (
                      <button
                        type="button"
                        key={eventName}
                        onClick={() => handleToggleEvent(eventName)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                          selected
                            ? 'bg-gold-400/20 border border-gold-400/50 text-gold-300'
                            : 'bg-white/5 border border-white/5 text-mist-300 hover:border-white/20'
                        }`}
                      >
                        <span className="truncate pr-1">{eventName}</span>
                        {selected && <CheckIcon className="w-3.5 h-3.5 shrink-0 text-gold-400" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-mist-400 mt-1.5">
                  Selected: {formData.events.length} of {ALL_EVENTS.length} events
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-mist-300 hover:bg-white/5 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold hover:bg-gold-300 disabled:opacity-50 transition"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
