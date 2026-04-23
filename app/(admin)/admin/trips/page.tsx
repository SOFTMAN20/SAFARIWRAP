'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Compass } from 'lucide-react';

interface TripRow {
  id: string;
  trip_name: string;
  start_date: string;
  end_date: string;
  status: 'Upcoming' | 'Completed';
  destination_names: string[];
  reviews_count: number;
  operators: { id: string; business_name: string } | { id: string; business_name: string }[] | null;
}

const FILTERS = ['All', 'Upcoming', 'Completed'] as const;
type Filter = (typeof FILTERS)[number];

export default function AdminTripsPage() {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const { data: trips = [], isLoading } = useQuery<TripRow[]>({
    queryKey: ['admin-trips'],
    queryFn: async () => {
      const res = await fetch('/api/admin/trips');
      const data = await res.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60,
  });

  const filtered = (trips ?? []).filter(t => {
    const op = Array.isArray(t.operators) ? t.operators[0] : t.operators;
    const matchesFilter = filter === 'All' || t.status === filter;
    const matchesSearch = !search ||
      t.trip_name.toLowerCase().includes(search.toLowerCase()) ||
      (op?.business_name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">All Trips</h1>
        <p className="text-sm text-slate-400 font-bold mt-0.5">{trips?.length ?? 0} trips across all operators</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex-1 max-w-sm shadow-sm">
          <Search size={15} className="text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search trip or operator..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-bold flex-1 placeholder:text-slate-300 outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                filter === f
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 text-[10px] opacity-70">({(trips ?? []).filter(t => t.status === f).length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 px-5 py-4 border-b border-slate-50">
              <div className="h-3.5 bg-slate-100 rounded animate-pulse w-48" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-32 ml-auto" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
            <Compass className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="font-black text-slate-900 mb-1">No trips found</h4>
          <p className="text-slate-400 text-sm font-bold">No {filter !== 'All' ? filter.toLowerCase() : ''} trips match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Trip</th>
                <th className="text-left px-5 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider hidden md:table-cell">Operator</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider hidden lg:table-cell">Dates</th>
                <th className="text-left px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-wider">Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(trip => {
                const op = Array.isArray(trip.operators) ? trip.operators[0] : trip.operators;
                return (
                  <tr key={trip.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-sm text-slate-900 truncate max-w-[200px]">{trip.trip_name}</p>
                      {trip.destination_names?.length > 0 && (
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">📍 {trip.destination_names.join(', ')}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {op ? (
                        <a href={`/admin/operators/${op.id}`} className="group">
                          <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 truncate max-w-[160px]">{op.business_name}</p>
                        </a>
                      ) : <span className="text-sm text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs font-bold text-slate-700">{format(new Date(trip.start_date), 'MMM d, yy')}</p>
                      <p className="text-xs text-slate-400">→ {format(new Date(trip.end_date), 'MMM d, yy')}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-black text-slate-900">{trip.reviews_count}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
