'use client';

import { useEffect, useState } from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import { AlertIcon, CheckIcon } from './landing/Icons';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('datathon'); // 'datathon' | 'iupc' | 'gaming'
  const [data, setData] = useState({ iupc: [], datathon: [], gaming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores team._id being approved

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/admin/registrations');
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch registrations');
      }
    } catch (e) {
      setError('Network error. Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* eventType is a parameter, not a constant: the same button now serves the
     Datathon and Gaming tables, and the two record "approved" differently —
     Datathon has a `paid` boolean, gaming has `registrationStatus`. */
  const handleApprovePayment = async (id, eventType) => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/v1/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, eventType, action: 'approve_payment' }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        // Reflect it locally so the row updates without a full refetch.
        setData((prev) => ({
          ...prev,
          [eventType]: prev[eventType].map((t) =>
            t._id === id
              ? eventType === 'gaming'
                ? { ...t, registrationStatus: 'paid' }
                : { ...t, paid: true }
              : t
          ),
        }));
        alert(result.message || 'Payment approved successfully!');
      } else {
        alert(result.message || 'Failed to approve payment.');
      }
    } catch (e) {
      alert('Network error. Failed to process approval.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white flex flex-col">
      <Navbar links={[]} homeHref="/" ctaHref="/api/auth/signout" ctaLabel="Sign Out" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Management Dashboard</h1>
            <p className="mt-1.5 text-sm text-mist-400">
              Welcome, <strong className="text-white">{user.name || user.email}</strong>. Manage registrations and verify payments.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="self-start sm:self-center px-4 py-2 text-xs font-bold rounded-lg border border-grape-400/40 bg-white/5 hover:bg-white/10 transition"
          >
            Refresh Data
          </button>
        </header>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertIcon className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6 flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('datathon')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'datathon'
                ? 'border-magenta-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Datathon Registrations ({data.datathon.length})
          </button>
          <button
            onClick={() => setActiveTab('iupc')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'iupc'
                ? 'border-aqua-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            IUPC Pre-Registrations ({data.iupc.length})
          </button>
          <button
            onClick={() => setActiveTab('gaming')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'gaming'
                ? 'border-gold-400 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Gaming ({data.gaming?.length ?? 0})
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-mist-400 animate-pulse">
            Loading registrations...
          </div>
        ) : (
          <div className="bg-ink-900/60 border border-ink-600 rounded-2xl overflow-hidden shadow-card">
            {activeTab === 'datathon' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Team Name</th>
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Members</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {data.datathon.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-mist-400">
                          No Datathon registrations found.
                        </td>
                      </tr>
                    ) : (
                      data.datathon.map((team) => (
                        <tr key={team._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-bold text-white">{team.teamName}</td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">{team.registrationId}</td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">{team.transactionId}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {team.members.map((m, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-semibold text-white">
                                    {m.name} {m.isTeamLeader && <span className="text-[10px] text-magenta-300 border border-magenta-300/30 px-1 rounded">Leader</span>}
                                  </span>
                                  <div className="text-mist-400">
                                    {m.universityName} · ID: {m.universityId}
                                  </div>
                                  <div className="text-mist-400">
                                    Kaggle: <span className="text-aqua-300">{m.kaggleUsername}</span> ({m.kaggleEmail}) · {m.phone}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {team.paid ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending Approval
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {!team.paid && (
                              <button
                                onClick={() => handleApprovePayment(team._id, 'datathon')}
                                disabled={actionLoading !== null}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gold-400 text-ink-950 hover:bg-gold-300 transition disabled:opacity-50"
                              >
                                {actionLoading === team._id ? 'Approving...' : 'Approve'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'iupc' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Team Name</th>
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Varsity</th>
                      <th className="px-6 py-4">Coach</th>
                      <th className="px-6 py-4">Members</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {data.iupc.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-mist-400">
                          No IUPC registrations found.
                        </td>
                      </tr>
                    ) : (
                      data.iupc.map((team) => (
                        <tr key={team._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-bold text-white">{team.teamName}</td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">{team.registrationId}</td>
                          <td className="px-6 py-4 text-mist-300">{team.varsityName}</td>
                          <td className="px-6 py-4 text-xs text-mist-300">
                            <div>{team.coach?.name}</div>
                            <div className="text-mist-400">{team.coach?.email}</div>
                            <div className="text-mist-400">{team.coach?.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {team.members.map((m, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-semibold text-white">
                                    {m.name} {m.isTeamLeader && <span className="text-[10px] text-aqua-300 border border-aqua-300/30 px-1 rounded">Leader</span>}
                                  </span>
                                  <div className="text-mist-400">
                                    CF: <span className="text-gold-300">{m.codeforcesHandle || 'N/A'}</span> · {m.phone}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Game</th>
                      <th className="px-6 py-4">Entry</th>
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Players</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {(data.gaming?.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-mist-400">
                          No gaming registrations found.
                        </td>
                      </tr>
                    ) : (
                      data.gaming.map((entry) => {
                        const paid = entry.registrationStatus === 'paid';
                        /* Only PUBG mails on approval; the badge says so, so an
                           admin is not left wondering whether one went out. */
                        const mails = entry.game === 'pubg-mobile';
                        return (
                          <tr key={entry._id} className="hover:bg-white/[0.02] transition">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{entry.game}</div>
                              {mails ? (
                                <span className="text-[10px] text-gold-300">emails on approval</span>
                              ) : (
                                <span className="text-[10px] text-mist-500">no email</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-white">
                                {entry.teamName || entry.contact?.name}
                              </div>
                              <div className="text-xs text-mist-400">
                                {entry.entryType} · {entry.contact?.email}
                              </div>
                              <div className="text-xs text-mist-400">{entry.contact?.phone}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-mist-300">
                              {entry.registrationId}
                            </td>
                            <td className="px-6 py-4 text-xs text-mist-300">
                              <div className="font-mono text-gold-300">
                                {entry.payment?.transactionId || '—'}
                              </div>
                              <div className="text-mist-400">
                                {entry.payment?.method}
                                {entry.payment?.amount != null && ` · ৳${entry.payment.amount}`}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {(entry.players || []).map((p, i) => (
                                  <div key={i} className="text-xs">
                                    <span className="font-semibold text-white">{p.name}</span>
                                    <span className="text-mist-400">
                                      {' '}· {p.ign || p.gameId || p.uid}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {paid ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  {entry.registrationStatus || 'pending'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {!paid && (
                                <button
                                  onClick={() => handleApprovePayment(entry._id, 'gaming')}
                                  disabled={actionLoading !== null}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gold-400 text-ink-950 hover:bg-gold-300 transition disabled:opacity-50"
                                >
                                  {actionLoading === entry._id ? 'Approving...' : 'Mark Paid'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
