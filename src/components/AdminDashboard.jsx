'use client';

import { useEffect, useState } from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import { AlertIcon, CheckIcon } from './landing/Icons';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('datathon'); // 'datathon' | 'iupc' | 'gaming' | 'it-quiz'
  const [data, setData] = useState({ iupc: [], datathon: [], gaming: [], 'it-quiz': [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores team._id being approved
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const handleBulkApprove = async () => {
    if (!bulkText.trim()) {
      alert('Please paste some text first!');
      return;
    }
    setBulkLoading(true);
    try {
      const res = await fetch('/api/v1/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_approve_payments', text: bulkText }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.message);
        setBulkText('');
        fetchData();
      } else {
        alert(result.message || 'Bulk approval failed.');
      }
    } catch (e) {
      alert('Network error. Failed to process bulk approval.');
    } finally {
      setBulkLoading(false);
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

        <div className="mb-6 flex flex-wrap border-b border-white/10">
          <button
            onClick={() => setActiveTab('datathon')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'datathon'
                ? 'border-magenta-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Datathon ({data.datathon?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('iupc')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'iupc'
                ? 'border-aqua-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            IUPC Pre-Reg ({data.iupc?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('gaming')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'gaming'
                ? 'border-gold-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Gaming ({data.gaming?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('volunteer')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'volunteer'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Volunteers ({data.volunteer?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('it-quiz')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'it-quiz'
                ? 'border-gold-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            IT Quiz ({data['it-quiz']?.length || 0})
          </button>
        </div>

        {(activeTab === 'datathon' || activeTab === 'gaming') && !loading && (
          <div className="mb-6 rounded-2xl border border-grape-500/20 bg-ink-900/30 p-5 shadow-card backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-1.5">Bulk Verify Payments via SMS Text</h3>
            <p className="text-xs text-mist-400 mb-3">
              Copy and paste the text body of your bKash payment SMS (or a list of messages) here. The system automatically extracts matching transaction IDs of unpaid teams and confirms them.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Example SMS: You have received BDT 300.00 from 017XXXXXXXX. Ref: PSTU. TxnID BKB123XYZ..."
                rows={2}
                className="w-full flex-1 rounded-xl border border-ink-500 bg-ink-950/50 px-3 py-2 text-sm text-white placeholder-mist-500 outline-none focus:border-magenta-500 focus:ring-1 focus:ring-magenta-500/25 transition"
              />
              <button
                onClick={handleBulkApprove}
                disabled={bulkLoading}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-magenta-600 hover:bg-magenta-500 text-white transition disabled:opacity-50 flex items-center justify-center min-w-[150px] shadow-glow-magenta"
              >
                {bulkLoading ? 'Processing...' : 'Bulk Approve SMS'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-mist-400 animate-pulse">
            Loading registrations...
          </div>
        ) : (
          <div className="bg-ink-900/60 border border-ink-600 rounded-2xl overflow-hidden shadow-card">
            {activeTab === 'datathon' && (
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
            )}

            {activeTab === 'gaming' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Game</th>
                      <th className="px-6 py-4">Reg ID / Team</th>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Players</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {data.gaming?.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-mist-400">
                          No Gaming registrations found.
                        </td>
                      </tr>
                    ) : (
                      data.gaming.map((team) => (
                        <tr key={team._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-bold text-white uppercase tracking-wider text-xs">
                            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">{team.game}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{team.teamName || 'Solo Entrant'}</div>
                            <div className="font-mono text-[11px] text-mist-400">{team.registrationId}</div>
                            <div className="text-[10px] text-mist-500 capitalize">{team.entryType}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-xs text-mist-300">{team.payment?.transactionId || 'N/A'}</div>
                            <div className="text-[10px] text-mist-500">Recv: {team.payment?.receiverNumber || 'N/A'}</div>
                            <div className="text-xs text-aqua-400">৳{team.payment?.amount || 0}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-mist-300">
                            <div>{team.contact?.name}</div>
                            <div className="text-mist-400">{team.contact?.email}</div>
                            <div className="text-mist-400">{team.contact?.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              {team.players?.map((p, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-semibold text-white">
                                    {p.name || 'Unnamed Player'} {p.isLeader && <span className="text-[9px] text-magenta-300 border border-magenta-300/30 px-1 rounded">Leader</span>}
                                  </span>
                                  <div className="text-mist-400">
                                    ID: <span className="text-gold-300">{p.gameId}</span> {p.device && `· ${p.device}`}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {team.registrationStatus === 'paid' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {team.registrationStatus !== 'paid' && (
                              <button
                                onClick={() => handleApprovePayment(team._id, 'gaming')}
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
            )}

            {activeTab === 'iupc' && (
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
            )}

            {activeTab === 'volunteer' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4">Email / Phone</th>
                      <th className="px-6 py-4">T-Shirt Size</th>
                      <th className="px-6 py-4">Selected Events</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {!data.volunteer || data.volunteer.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-mist-400">
                          No volunteer registrations found.
                        </td>
                      </tr>
                    ) : (
                      data.volunteer.map((v) => (
                        <tr key={v._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-mono text-xs text-gold-400 font-bold">{v.registrationId}</td>
                          <td className="px-6 py-4 font-bold text-white">{v.fullName}</td>
                          <td className="px-6 py-4 text-mist-300 font-mono text-xs">{v.studentId}</td>
                          <td className="px-6 py-4 text-xs text-mist-300">
                            <div className="text-white font-medium">{v.email || 'N/A'}</div>
                            <div className="text-mist-400">{v.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-mist-300">
                            {v.tShirtSize || 'M'}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {v.events?.map((evt) => (
                                <span key={evt} className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-aqua-300">
                                  {evt}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'it-quiz' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Name / ID</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Academic Info</th>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {!data['it-quiz'] || data['it-quiz'].length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-mist-400">
                          No IT Quiz registrations found.
                        </td>
                      </tr>
                    ) : (
                      data['it-quiz'].map((entry) => (
                        <tr key={entry._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{entry.fullName}</div>
                            <div className="font-mono text-[11px] text-mist-400">{entry.registrationId}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-mist-300">
                            <div>{entry.whatsapp}</div>
                            <div className="text-mist-400">{entry.email || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-mist-300">
                            <div className="font-semibold text-white">{entry.universityName}</div>
                            <div>ID: {entry.academicId}</div>
                            <div className="text-mist-400">
                              {entry.faculty} · Sem: {entry.semester} · Sess: {entry.session}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">
                            <div>{entry.payment?.transactionId}</div>
                            <div className="text-[10px] text-mist-500">Recv: {entry.payment?.receiverNumber || 'N/A'}</div>
                            <div className="text-xs text-aqua-400">৳{entry.payment?.amount || 50}</div>
                          </td>
                          <td className="px-6 py-4">
                            {entry.paid ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {!entry.paid && (
                              <button
                                onClick={() => handleApprovePayment(entry._id, 'it-quiz')}
                                disabled={actionLoading !== null}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gold-400 text-ink-950 hover:bg-gold-300 transition disabled:opacity-50"
                              >
                                {actionLoading === entry._id ? 'Approving...' : 'Approve'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
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
