'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from './landing/Navbar';
import Footer from './landing/Footer';
import { AlertIcon, CheckIcon } from './landing/Icons';
import VolunteerTable from './admin/VolunteerTable';
import printTable from './admin/printTable';
import { REGISTRATION_PRINT, IUPC_KIT_PRINT, tshirtCounts } from './admin/registrationPrint';
import { SECTION_FILTERS } from './admin/sectionFilters';

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('datathon'); // 'datathon' | 'iupc' | 'gaming' | 'it-quiz' | 'volunteer' | 'project-showcase'
  const [data, setData] = useState({ iupc: [], datathon: [], gaming: [], 'it-quiz': [], volunteer: [], 'project-showcase': [], hackathon: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores team._id being approved
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  /* Kept apart from actionLoading so notifying one team does not grey out every
     Approve button on the page. */
  const [notifyLoading, setNotifyLoading] = useState(null); // team._id being notified
  const [filterSelections, setFilterSelections] = useState({}); // tab -> selected filter key

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
              ? eventType === 'gaming' || eventType === 'iupc'
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

  /* "The fee is due" to one team's leader.
     The row goes green off paymentNotifiedAt, which the server returns, so the
     state survives a reload rather than living in this component. A failure
     leaves the row exactly as it was — still offering the button, which is the
     retry. */
  const handleNotify = async (id) => {
    setNotifyLoading(id);
    try {
      const res = await fetch('/api/v1/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, eventType: 'iupc', action: 'notify_payment' }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData((prev) => ({
          ...prev,
          iupc: prev.iupc.map((t) =>
            t._id === id
              ? { ...t, paymentNotifiedAt: result.data?.paymentNotifiedAt || new Date().toISOString() }
              : t
          ),
        }));
      } else {
        alert(result.message || 'Failed to send the notification.');
      }
    } catch (e) {
      alert('Network error. The notification was not sent.');
    } finally {
      setNotifyLoading(null);
    }
  };

  /* Downloads the team leader addresses so the announcement can be sent from a
     mail client, the way the datathon list already works.
     One address per team, not per member: IUPC correspondence goes to the
     leader alone, which is what the isTeamLeader flag exists for. */
  const exportIupcLeaderEmails = (teams) => {
    const emails = teams
      .map((team) => (team.members || []).find((m) => m.isTeamLeader)?.email)
      .filter(Boolean);

    if (emails.length === 0) {
      alert('No team leader emails to export!');
      return;
    }

    const unique = [...new Set(emails)];
    const blob = new Blob([unique.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iupc_leader_emails.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  /* The volunteer tab owns its own toolbar — it has several filters and a
     search box. Everything below drives the other four. */
  const printConfig = REGISTRATION_PRINT[activeTab];
  const filterDef = SECTION_FILTERS[activeTab];
  const activeList = useMemo(() => data[activeTab] || [], [data, activeTab]);

  /* Selections are kept per tab so switching away and back does not silently
     reset what an admin was looking at. '' is a real key (the missing-value
     bucket), so the default is resolved with ?? rather than ||. */
  const selectedFilter = filterSelections[activeTab] ?? 'all';
  const filterActive = Boolean(filterDef) && selectedFilter !== 'all';

  const filterOptions = useMemo(() => {
    if (!filterDef) return [];
    const buckets = new Map();
    for (const row of activeList) {
      const key = filterDef.keyOf(row);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.count += 1;
      } else {
        buckets.set(key, {
          value: key,
          count: 1,
          label: key ? filterDef.labelFor(key, row) : filterDef.unknownLabel,
        });
      }
    }
    return [...buckets.values()].sort((a, b) => {
      if (!a.value || !b.value) return a.value ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }, [activeList, filterDef]);

  const visibleList = useMemo(() => {
    if (!filterDef || selectedFilter === 'all') return activeList;
    return activeList.filter((row) => filterDef.keyOf(row) === selectedFilter);
  }, [activeList, filterDef, selectedFilter]);

  const nounFor = (count) =>
    count === 1 ? printConfig?.noun.one : printConfig?.noun.many;

  /* A filter hiding every row is a different situation from an empty section,
     and saying which one it is stops an admin thinking data went missing. */
  const emptyMessage = (whenSectionEmpty) =>
    activeList.length > 0 && filterActive
      ? `No ${printConfig.noun.many} match the current filter.`
      : whenSectionEmpty;

  /* Printed sheets say which slice they are, so a filtered stack cannot be
     mistaken for the whole section later. */
  const printSummary = (list, includeFilter) => {
    const base = printConfig.summary(list);
    if (!includeFilter || !filterActive) return base;
    const chosen = filterOptions.find((option) => option.value === selectedFilter);
    return `${filterDef.summaryLabel}: ${chosen?.label || selectedFilter}  ·  ${base}`;
  };

  const handlePrint = (list, includeFilter) =>
    printTable({
      title: printConfig.title,
      summary: printSummary(list, includeFilter),
      columns: printConfig.columns,
      rows: list,
    });

  /* Contest-day paperwork, both derived from the paid teams and nothing else.
     A team that has not settled the fee is not collecting a kit and is not
     getting a shirt printed for it, so the filter is the whole point rather
     than a convenience — see IUPC_KIT_PRINT. Reads activeList, not
     visibleList: the university filter is for looking things up on screen, and
     a kit sheet missing eleven universities because a dropdown was left set is
     the kind of mistake nobody catches until the desk runs out of bags. */
  const paidIupcTeams = useMemo(
    () => (data.iupc || []).filter((t) => t.registrationStatus === 'paid'),
    [data.iupc]
  );

  const handleKitPrint = () =>
    printTable({
      title: IUPC_KIT_PRINT.title,
      summary: IUPC_KIT_PRINT.summary(paidIupcTeams),
      columns: IUPC_KIT_PRINT.columns,
      rows: paidIupcTeams,
    });

  /* CSV rather than the plain list the email exports use — this one goes to
     whoever is ordering the shirts, and a spreadsheet is what they open. */
  const handleTshirtExport = () => {
    const { rows, total } = tshirtCounts(paidIupcTeams);
    if (total === 0) {
      alert('No paid teams yet — there are no t-shirts to count.');
      return;
    }

    const csv = [
      'Size,Count',
      ...rows.map((r) => `${r.size},${r.count}`),
      `TOTAL,${total}`,
      '',
      `# IUPC t-shirts for ${paidIupcTeams.length} paid team(s)`,
      `# Generated ${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'iupc_tshirt_counts.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <button
            onClick={() => setActiveTab('project-showcase')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'project-showcase'
                ? 'border-magenta-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Project Showcasing ({data['project-showcase']?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('hackathon')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'hackathon'
                ? 'border-magenta-500 text-white'
                : 'border-transparent text-mist-400 hover:text-white'
            }`}
          >
            Hackathon ({data.hackathon?.length || 0})
          </button>
        </div>

        {activeTab === 'iupc' && !loading && (
          <div className="mb-6 rounded-2xl border border-aqua-400/20 bg-ink-900/30 p-5 shadow-card backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-1.5">Announce the entry fee</h3>
            {/* Sending the whole list from here is gone. It reported teams as
                notified whose mail nobody received, and a green button that
                lies is worse than no button — a coordinator reads it as done
                and never follows up. Export the addresses and send from a mail
                client instead, the way the datathon list already works: the
                client shows what bounced, which this panel could not.
                The per-row Notify button stays. It sends one message on one
                connection and has been verified working. */}
            <p className="text-xs text-mist-400 mb-3">
              Download the team leader addresses and send the announcement from
              your own mail client — one address per team, BCC them. The
              individual <span className="font-semibold text-mist-300">Notify</span>{' '}
              button on a row still sends the templated mail to that one leader.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  exportIupcLeaderEmails(
                    (data.iupc || []).filter((t) => t.registrationStatus !== 'paid')
                  )
                }
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                Export unpaid leader emails
              </button>
              <button
                onClick={() => exportIupcLeaderEmails(data.iupc || [])}
                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-white/15 bg-white/5 text-mist-200 hover:bg-white/10 transition"
              >
                Export all
              </button>
              <span className="text-xs text-mist-400">
                {(() => {
                  const list = data.iupc || [];
                  const unpaid = list.filter((t) => t.registrationStatus !== 'paid').length;
                  return `${unpaid} unpaid of ${list.length} team${list.length === 1 ? '' : 's'}`;
                })()}
              </span>
            </div>
          </div>
        )}

        {/* The sweep itself is not per-tab — one paste is matched against every
            event's unpaid entries at once, so which tab you start it from
            changes nothing. The box appears on the tabs whose entries it can
            actually approve, which is what makes it discoverable. */}
        {['datathon', 'gaming', 'iupc', 'it-quiz'].includes(activeTab) && !loading && (
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
            {printConfig && (
              <div className="border-b border-white/10 bg-ink-950/30 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {filterDef && filterOptions.length > 0 && (
                      <select
                        value={selectedFilter}
                        onChange={(e) =>
                          setFilterSelections((prev) => ({ ...prev, [activeTab]: e.target.value }))
                        }
                        className="rounded-lg border border-ink-500 bg-ink-950/60 px-3 py-2 text-xs font-medium text-white outline-none focus:border-grape-400 focus:ring-1 focus:ring-grape-400/30 transition"
                      >
                        <option value="all" className="bg-ink-900">
                          {filterDef.allLabel} ({activeList.length})
                        </option>
                        {filterOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-ink-900">
                            {option.label} ({option.count})
                          </option>
                        ))}
                      </select>
                    )}

                    <p className="text-xs text-mist-400">
                      {filterActive ? (
                        <>
                          Showing <span className="font-bold text-white">{visibleList.length}</span> of{' '}
                          <span className="font-bold text-white">{activeList.length}</span>{' '}
                          {nounFor(activeList.length)}
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-white">{activeList.length}</span>{' '}
                          {nounFor(activeList.length)}
                        </>
                      )}
                      {visibleList.length > 0 && (
                        <span className="text-mist-500"> · {printConfig.summary(visibleList)}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(activeTab === 'hackathon' || activeTab === 'datathon') && (
                      <button
                        onClick={() => {
                          const emailKey = activeTab === 'datathon' ? 'kaggleEmail' : 'email';
                          const emails = activeList.flatMap((team) => (team.members || []).map((m) => m[emailKey])).filter(Boolean);
                          if (emails.length === 0) {
                            alert('No emails to export!');
                            return;
                          }
                          const blob = new Blob([emails.join('\n')], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${activeTab}_emails.txt`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      >
                        Export Emails
                      </button>
                    )}
                    <button
                      onClick={() => handlePrint(visibleList, true)}
                      disabled={visibleList.length === 0}
                      className="px-4 py-2 text-xs font-bold rounded-lg bg-grape-600 hover:bg-grape-500 text-white transition disabled:opacity-40 disabled:hover:bg-grape-600"
                    >
                      Print / Save PDF ({visibleList.length})
                    </button>
                    {filterActive && (
                      <button
                        onClick={() => handlePrint(activeList, false)}
                        disabled={activeList.length === 0}
                        className="px-4 py-2 text-xs font-bold rounded-lg border border-grape-400/40 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-40"
                      >
                        Print All ({activeList.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Contest-day sheets, kept off the main row because they are
                    not "print what is on screen" — both ignore the filter and
                    both cover paid teams only. */}
                {activeTab === 'iupc' && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 mt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mist-400 mr-2">
                      Contest day:
                    </span>
                    <button
                      onClick={handleKitPrint}
                      disabled={paidIupcTeams.length === 0}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white/5 border border-white/10 text-mist-300 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Kit Handover Sheet ({paidIupcTeams.length} paid)
                    </button>
                    <button
                      onClick={handleTshirtExport}
                      disabled={paidIupcTeams.length === 0}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white/5 border border-white/10 text-mist-300 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Export T-Shirt Counts ({tshirtCounts(paidIupcTeams).total})
                    </button>
                    <span className="text-[11px] text-mist-500">
                      Paid teams only · ignores the university filter
                    </span>
                  </div>
                )}

                {activeTab === 'gaming' && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 mt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-mist-400 mr-2">Print by Game:</span>
                    {[
                      { slug: 'free-fire', label: 'Free Fire' },
                      { slug: 'pubg-mobile', label: 'PUBG' },
                      { slug: 'ludo', label: 'Ludo' },
                      { slug: 'chess', label: 'Chess' },
                      { slug: 'efootball', label: 'eFootball' },
                      { slug: 'rubiks-cube', label: "Rubik's" }
                    ].map((g) => {
                      const count = activeList.filter((e) => String(e.game || '').trim().toLowerCase() === g.slug).length;
                      return (
                        <button
                          key={g.slug}
                          onClick={() => {
                            const gameList = activeList.filter((e) => String(e.game || '').trim().toLowerCase() === g.slug);
                            printTable({
                              title: `${g.label} Registrations`,
                              summary: `Game: ${g.label} · ${printConfig.summary(gameList)}`,
                              columns: printConfig.columns,
                              rows: gameList,
                            });
                          }}
                          disabled={count === 0}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white/5 border border-white/10 text-mist-300 hover:bg-white/10 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {g.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                    {visibleList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-mist-400">
                          {emptyMessage('No Datathon registrations found.')}
                        </td>
                      </tr>
                    ) : (
                      visibleList.map((team) => (
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
                    {visibleList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-mist-400">
                          {emptyMessage('No Gaming registrations found.')}
                        </td>
                      </tr>
                    ) : (
                      visibleList.map((team) => (
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
                            {/* A free tournament has nothing to reconcile —
                                showing ৳0 next to a blank transaction ID reads
                                like an unpaid fee rather than no fee. */}
                            {team.payment?.amount === 0 ? (
                              <div className="text-xs font-semibold text-aqua-400">Free entry</div>
                            ) : (
                              <>
                                <div className="font-mono text-xs text-mist-300">{team.payment?.transactionId || 'N/A'}</div>
                                <div className="text-[10px] text-mist-500">Recv: {team.payment?.receiverNumber || 'N/A'}</div>
                                <div className="text-xs text-aqua-400">৳{team.payment?.amount || 0}</div>
                              </>
                            )}
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
                                {/* Nothing was verified on a free entry — a
                                    human confirmed it, which is a different
                                    claim to make in an audit. */}
                                {team.payment?.amount === 0 ? 'Confirmed' : 'Verified'}
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
                                {/* No payment to approve on a free entry —
                                    the admin is confirming a place. */}
                                {actionLoading === team._id
                                  ? team.payment?.amount === 0
                                    ? 'Confirming...'
                                    : 'Approving...'
                                  : team.payment?.amount === 0
                                    ? 'Confirm'
                                    : 'Approve'}
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
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {visibleList.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-10 text-center text-mist-400">
                          {emptyMessage('No IUPC registrations found.')}
                        </td>
                      </tr>
                    ) : (
                      visibleList.map((team) => (
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
                                  <div className="text-mist-400">{m.phone}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {team.payment?.transactionId ? (
                              <div className="text-xs">
                                <div className="font-mono text-mist-300">{team.payment.transactionId}</div>
                                <div className="text-[10px] text-mist-500">
                                  {team.payment.method} · Recv: {team.payment.receiverNumber || 'N/A'}
                                </div>
                                <div className="text-xs text-aqua-400">৳{team.payment.amount}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-mist-500">Not submitted</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {team.registrationStatus === 'paid' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Paid
                              </span>
                            ) : team.registrationStatus === 'payment-submitted' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Awaiting check
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-mist-400 border border-white/10">
                                <span className="h-1.5 w-1.5 rounded-full bg-mist-500" />
                                Pre-registered
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-start gap-2">
                            {/* Two ways a team gets paid, and both end at the
                                same status.

                                A team that submitted a reference online is
                                approved outright — the reference is right there
                                in the previous column to check against the
                                statement.

                                A team that paid in cash at the desk, or over a
                                wallet whose SMS the coordinator read elsewhere,
                                never touched the form and sits at
                                'pre-registered'. Offering nothing here left the
                                panel unable to record a payment it had actually
                                received, so the button is offered for those rows
                                too — behind a confirm, because there is no
                                reference on screen to check and the approval
                                emails the team leader either way. */}
                            {team.registrationStatus !== 'paid' && (
                              <button
                                onClick={() => {
                                  if (
                                    team.registrationStatus !== 'payment-submitted' &&
                                    !window.confirm(
                                      `${team.teamName} has not submitted a transaction ID. Mark it paid anyway and email the team leader?`
                                    )
                                  ) {
                                    return;
                                  }
                                  handleApprovePayment(team._id, 'iupc');
                                }}
                                disabled={actionLoading !== null}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition disabled:opacity-50 ${
                                  team.registrationStatus === 'payment-submitted'
                                    ? 'bg-gold-400 text-ink-950 hover:bg-gold-300'
                                    : 'border border-white/15 bg-white/5 text-mist-200 hover:bg-white/10'
                                }`}
                              >
                                {actionLoading === team._id
                                  ? 'Approving...'
                                  : team.registrationStatus === 'payment-submitted'
                                    ? 'Approve'
                                    : 'Mark paid'}
                              </button>
                            )}

                            {/* Green means the announcement reached this team's
                                leader — it reads paymentNotifiedAt from the
                                database, not from this session, so it is still
                                green tomorrow. It stays clickable: green is a
                                record of what happened, not a lock, and "resend
                                it, I deleted the mail" is a normal request.
                                A team that has paid needs no announcement. */}
                            {team.registrationStatus !== 'paid' && (
                              <button
                                onClick={() => handleNotify(team._id)}
                                disabled={notifyLoading !== null}
                                title={
                                  team.paymentNotifiedAt
                                    ? `Notified ${new Date(team.paymentNotifiedAt).toLocaleString()} — click to send again`
                                    : 'Email the team leader that the entry fee is due'
                                }
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition disabled:opacity-50 ${
                                  team.paymentNotifiedAt
                                    ? 'border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                    : 'border border-aqua-400/30 bg-aqua-400/10 text-aqua-300 hover:bg-aqua-400/20'
                                }`}
                              >
                                {notifyLoading === team._id
                                  ? 'Sending…'
                                  : team.paymentNotifiedAt
                                    ? '✓ Notified'
                                    : 'Notify'}
                              </button>
                            )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'volunteer' && <VolunteerTable volunteers={data.volunteer} />}

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
                    {visibleList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-mist-400">
                          {emptyMessage('No IT Quiz registrations found.')}
                        </td>
                      </tr>
                    ) : (
                      visibleList.map((entry) => (
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

            {activeTab === 'project-showcase' && (
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
                    {!data['project-showcase'] || data['project-showcase'].length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-mist-400">
                          No Project Showcasing registrations found.
                        </td>
                      </tr>
                    ) : (
                      data['project-showcase'].map((team) => (
                        <tr key={team._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-bold text-white">{team.teamName}</td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">{team.registrationId}</td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">{team.transactionId}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {(team.members || []).map((m, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className="font-semibold text-white">
                                    {m.name} {m.isTeamLeader && <span className="text-[10px] text-magenta-300 border border-magenta-300/30 px-1 rounded">Leader</span>}
                                  </span>
                                  <div className="text-mist-400">
                                    {m.universityName} · ID: {m.universityId}
                                  </div>
                                  <div className="text-mist-400">
                                    Phone: {m.phone} · Email: {m.email}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {team.paid ? (
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
                            {!team.paid && (
                              <button
                                onClick={() => handleApprovePayment(team._id, 'project-showcase')}
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

            {activeTab === 'hackathon' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-ink-950/40 text-xs font-bold uppercase tracking-wider text-mist-400">
                      <th className="px-6 py-4">Team Name</th>
                      <th className="px-6 py-4">Reg ID</th>
                      <th className="px-6 py-4">Members</th>
                      <th className="px-6 py-4">Shortlisted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {visibleList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-10 text-center text-mist-400">
                          {emptyMessage('No Hackathon pre-registrations found.')}
                        </td>
                      </tr>
                    ) : (
                      visibleList.map((team) => (
                        <tr key={team._id} className="hover:bg-white/[0.02] transition">
                          <td className="px-6 py-4 font-bold text-white">{team.teamName}</td>
                          <td className="px-6 py-4 font-mono text-xs text-mist-300">{team.registrationId}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {team.members.map((m, i) => (
                                <div key={i} className="text-xs">
                                  <span className="font-semibold text-white">
                                    {m.fullName} {m.isTeamLeader && <span className="text-[10px] text-magenta-300 border border-magenta-300/30 px-1 rounded">Leader</span>}
                                  </span>
                                  <div className="text-mist-400">
                                    {m.universityName} · {m.department} · T-Shirt: {m.tshirtSize}
                                  </div>
                                  <div className="text-mist-400">
                                    WhatsApp: {m.whatsapp} · Email: {m.email}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {team.shortlisted ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                No
                              </span>
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
