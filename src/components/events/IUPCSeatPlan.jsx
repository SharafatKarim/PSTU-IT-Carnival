'use client';

import { useEffect, useState } from 'react';
import { getEventDetail } from '@/data/events';
import { eventSeatPlanNav } from '@/lib/routes';
import EventSubPage, { SubPageTabs } from './EventSubPage';

const ROOM_OPTIONS = ['All Rooms', 'CIT Lab', 'Mobile Apps', 'ACL Lab'];

export default function IUPCSeatPlan({ slug = 'iupc' }) {
  const event = getEventDetail(slug);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [roomFilter, setRoomFilter] = useState('All Rooms');

  useEffect(() => {
    let active = true;
    const fetchSeatPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/events/iupc/registrations?limit=100');
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to load seat plans');
        }
        if (active) {
          const list = json.data?.teams || [];
          // Sort teams by University Name ascending first, then Team Name ascending
          const sorted = [...list].sort((a, b) => {
            const uA = (a.varsityName || '').trim().toLowerCase();
            const uB = (b.varsityName || '').trim().toLowerCase();
            if (uA !== uB) return uA.localeCompare(uB);
            return (a.teamName || '').trim().toLowerCase().localeCompare((b.teamName || '').trim().toLowerCase());
          });
          setTeams(sorted);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSeatPlans();
    return () => {
      active = false;
    };
  }, []);

  // Filter teams by search & room filter
  const filteredTeams = teams.filter((t) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (t.teamName || '').toLowerCase().includes(q) ||
      (t.varsityName || '').toLowerCase().includes(q) ||
      (t.teamId || t.registrationId || '').toLowerCase().includes(q) ||
      (t.room || '').toLowerCase().includes(q) ||
      (t.seat || '').toString().toLowerCase().includes(q);

    const matchesRoom =
      roomFilter === 'All Rooms' ||
      (t.room || '').toLowerCase() === roomFilter.toLowerCase();

    return matchesSearch && matchesRoom;
  });

  const totalAssigned = teams.filter((t) => t.room && t.seat).length;

  return (
    <EventSubPage
      event={event}
      slug={slug}
      nav={eventSeatPlanNav(slug)}
      eyebrow="Contest Day Allocations"
      title="IUPC Team Seat Plans"
      intro="Find your team's designated contest classroom and bench seat number for IUPC 2026."
      tabs={<SubPageTabs slug={slug} active="seat-plan" />}
    >
      <div className="space-y-6">
        {/* Controls Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-ink-600 bg-ink-900/80 p-4 sm:p-6 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by team name, university, team ID, room, seat..."
                className="w-full rounded-xl border border-ink-600 bg-ink-950 px-4 py-2.5 text-sm text-white placeholder-mist-500 outline-none transition focus:border-magenta-500 focus:ring-2 focus:ring-magenta-500/30"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-mist-300">
              <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 font-semibold">
                {filteredTeams.length} Team{filteredTeams.length === 1 ? '' : 's'} Listed
              </span>
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 font-semibold text-emerald-300">
                {totalAssigned} Seats Allocated
              </span>
            </div>
          </div>

          {/* Room Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ink-700/60">
            <span className="text-xs font-semibold text-mist-400 mr-1">Filter Room:</span>
            {ROOM_OPTIONS.map((room) => (
              <button
                key={room}
                onClick={() => setRoomFilter(room)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  roomFilter === room
                    ? 'bg-gold-400 text-ink-950 shadow-glow-gold'
                    : 'border border-white/10 bg-white/5 text-mist-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="rounded-2xl border border-ink-600 bg-ink-900/60 p-12 text-center text-sm text-mist-400">
            Loading seat plan allocations...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center text-sm text-red-300">
            {error}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="rounded-2xl border border-ink-600 bg-ink-900/60 p-12 text-center text-sm text-mist-400">
            No teams found matching your search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((t) => {
              const displayTeamId = t.teamId || t.registrationId || 'N/A';
              const displayRoom = t.room || 'TBD';
              const displaySeat = t.seat ? `Seat ${t.seat}` : 'TBD';
              const isAllocated = Boolean(t.room && t.seat);

              return (
                <div
                  key={t.registrationId}
                  className="flex flex-col justify-between rounded-2xl border border-ink-600 bg-ink-900/80 p-5 shadow-card transition hover:border-magenta-500/50 hover:bg-ink-900"
                >
                  <div>
                    {/* Header: Team ID tag */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-ink-700/60">
                      <span className="font-mono text-xs font-bold text-mist-300">
                        {displayTeamId}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isAllocated
                            ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border border-gold-400/40 bg-gold-400/10 text-gold-300'
                        }`}
                      >
                        {isAllocated ? 'Allocated' : 'Pending'}
                      </span>
                    </div>

                    {/* Team & Varsity */}
                    <div className="mt-3">
                      <h3 className="text-base font-extrabold text-white leading-snug">
                        {t.teamName}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-mist-300">
                        {t.varsityName}
                      </p>
                    </div>
                  </div>

                  {/* Footer: Room & Seat Location */}
                  <div className="mt-5 pt-3 border-t border-ink-700/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-mist-400">
                        Room:
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-bold text-white">
                        {displayRoom}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-mist-400">
                        Seat:
                      </span>
                      <span className="rounded-lg border border-magenta-500/40 bg-magenta-500/10 px-2.5 py-1 text-xs font-extrabold text-magenta-300">
                        {displaySeat}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </EventSubPage>
  );
}
