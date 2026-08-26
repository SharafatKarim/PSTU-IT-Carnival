'use client';

import { useEffect, useState } from 'react';
import { CloseIcon, CheckIcon, AlertIcon } from '@/components/landing/Icons';
import { IUPC_PAYMENT, iupcPaymentTotal, HACKATHON_PAYMENT, hackathonPaymentTotal } from '@/data/events';
import { submitPayment } from '@/services/events/iupc';

/* Entry-fee submission for one team, launched from its row in the directory.
 *
 * The team pays first, from its own wallet, then reports the reference here.
 * Nothing is confirmed on submit — a coordinator matches it against the wallet
 * statement afterwards, and the team leader is emailed when they do.
 *
 * The leader's email is asked for because this form is reachable from a public
 * page that lists every registration ID. It is the one detail the directory
 * withholds, so it is what distinguishes the team from a passer-by. */
const PaymentModal = ({ team, onClose, onPaid }) => {
  const isHackathon = team.registrationId?.startsWith('PSTU-HACK-');
  const slug = isHackathon ? 'hackathon' : 'iupc';
  const paymentConfig = isHackathon ? HACKATHON_PAYMENT : IUPC_PAYMENT;
  const total = isHackathon ? hackathonPaymentTotal() : iupcPaymentTotal();
  const methods = isHackathon ? ['bKash', 'Nagad'] : IUPC_PAYMENT.methods;

  const [form, setForm] = useState({
    leaderEmail: '',
    method: methods[0],
    transactionId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(null);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!form.leaderEmail.trim()) {
      setError('Enter the team leader’s email — the one used at pre-registration.');
      return;
    }
    /* Same rule the API enforces — a digits-only reference is a phone number or
       an amount, and the approver must never auto-match on one. */
    if (!/^(?=.*[A-Za-z])[A-Za-z0-9]{6,25}$/.test(form.transactionId.trim())) {
      setError(
        'Transaction ID is 6–25 letters and digits with no spaces, and must contain at least one letter.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await submitPayment(slug, {
        registrationId: team.registrationId,
        leaderEmail: form.leaderEmail.trim(),
        method: form.method,
        transactionId: form.transactionId.trim(),
      });
      setDone(result.message);
      onPaid?.(team.registrationId);
    } catch (err) {
      setError(err.message || 'Payment could not be submitted.');
      const list = err.response?.data?.errors;
      if (Array.isArray(list)) {
        setFieldErrors(
          Object.fromEntries(list.map((item) => [item.field, item.message]))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full rounded-xl border bg-ink-950/70 px-4 py-2.5 text-sm text-white outline-none transition focus:ring-1 ${
      fieldErrors[field]
        ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30'
        : 'border-white/10 focus:border-gold-400 focus:ring-gold-400/30'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-950/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Pay the entry fee for ${team.teamName}`}
    >
      <div
        className="relative my-8 w-full max-w-lg rounded-2xl border border-white/10 bg-ink-900 p-6 text-white shadow-glow-grape sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-2 text-mist-400 transition hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold-400/40 bg-gold-400/10 text-gold-400">
              <CheckIcon className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold">Payment submitted</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mist-300">
              {done}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 pb-4 pr-8">
              <h2 className="text-xl font-extrabold">Pay the entry fee</h2>
              <p className="mt-1 text-sm text-mist-300">
                <span className="font-semibold text-white">{team.teamName}</span>
                <span className="text-mist-500"> · {team.teamId || team.registrationId}</span>
              </p>
            </div>

            {/* Send first, report after — the transaction ID is the proof. */}
            <div className="mt-5 overflow-hidden rounded-xl border border-gold-400/25 bg-gold-400/[0.06]">
              <div className="grid gap-px bg-white/5 sm:grid-cols-2">
                <div className="bg-ink-900/60 px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-mist-500">
                    Amount to send
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-gold-300">৳{total}</p>
                  {isHackathon ? (
                    <p className="mt-0.5 text-[11px] text-mist-500">
                      ৳{paymentConfig.fee} entry fee (No cash-out charge required)
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[11px] text-mist-500">
                      ৳{IUPC_PAYMENT.fee} entry fee + ৳{IUPC_PAYMENT.cashOutCharge} cash-out
                      charge
                    </p>
                  )}
                </div>
                <div className="bg-ink-900/60 px-4 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-mist-500">
                    Send to
                  </p>
                  {isHackathon ? (
                    <div className="mt-1 space-y-1 font-mono text-sm font-extrabold text-white">
                      {paymentConfig.numbers.map((n) => (
                        <div key={n.value} className="flex justify-between select-all">
                          <span>{n.value}</span>
                          <span className="text-[10px] text-mist-400 font-normal">({n.label})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="mt-1 select-all font-mono text-xl font-extrabold text-white">
                        {IUPC_PAYMENT.number}
                      </p>
                      <p className="mt-0.5 text-[11px] text-mist-500">
                        Accepted: {IUPC_PAYMENT.methods.join(' · ')}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <p className="border-t border-white/5 px-4 py-3 text-xs leading-relaxed text-mist-300">
                {paymentConfig.instructions}
              </p>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                <AlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-300">
                  Team Leader Email <span className="text-gold-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.leaderEmail}
                  onChange={set('leaderEmail')}
                  placeholder="the email used at pre-registration"
                  className={inputClass('leaderEmail')}
                />
                <p className="mt-1.5 text-[11px] text-mist-400">
                  {fieldErrors.leaderEmail ||
                    'Confirms this team is yours — the directory never shows emails.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-300">
                    Paid With <span className="text-gold-400">*</span>
                  </label>
                  <select
                    value={form.method}
                    onChange={set('method')}
                    className={inputClass('method')}
                  >
                    {methods.map((m) => (
                      <option key={m} value={m} className="bg-ink-900">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-300">
                    Transaction ID <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={form.transactionId}
                    onChange={set('transactionId')}
                    placeholder="e.g. 9F7A2B4C1D"
                    className={`${inputClass('transactionId')} font-mono uppercase`}
                  />
                </div>
              </div>
              {fieldErrors.transactionId && (
                <p className="-mt-2 text-[11px] text-red-300">{fieldErrors.transactionId}</p>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-mist-300 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gold-400 px-6 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 disabled:opacity-50"
                >
                  {loading ? 'Submitting…' : 'Submit payment'}
                </button>
              </div>
            </form>

            <p className="mt-4 text-[11px] leading-relaxed text-mist-500">
              Submitting records the reference only. A coordinator checks it
              against the wallet statement, and your team leader is emailed once
              it is confirmed.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
