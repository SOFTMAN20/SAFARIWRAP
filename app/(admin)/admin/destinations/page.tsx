'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, MapPin, Globe, Mountain, Trees } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Destination } from '@/lib/types';

interface DestinationForm {
  name: string;
  country: string;
  emoji: string;
  fun_fact: string;
  area: string;
  wildlife_highlight: string;
}

const EMPTY: DestinationForm = { name: '', country: '', emoji: '🌍', fun_fact: '', area: '', wildlife_highlight: '' };

export default function AdminDestinationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState<DestinationForm>(EMPTY);
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);

  const { data: destinations = [], isLoading } = useQuery<Destination[]>({
    queryKey: ['admin-destinations'],
    queryFn: async () => {
      const res = await fetch('/api/admin/destinations');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DestinationForm) =>
      fetch('/api/admin/destinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-destinations'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DestinationForm }) =>
      fetch(`/api/admin/destinations/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-destinations'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-destinations'] }); setDeleteTarget(null); },
  });

  function openCreate() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(d: Destination) {
    setEditing(d);
    setForm({ name: d.name, country: d.country, emoji: d.emoji, fun_fact: d.fun_fact ?? '', area: d.area ?? '', wildlife_highlight: d.wildlife_highlight ?? '' });
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditing(null); setForm(EMPTY); }

  const filtered = (destinations ?? []).filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Destinations</h1>
            <p className="text-sm text-slate-500 font-semibold">Manage safari locations and wildlife highlights</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Destination</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-600 mb-1">Total Destinations</p>
                    <p className="text-3xl font-black text-emerald-700">{destinations?.length ?? 0}</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 mb-1">Countries</p>
                    <p className="text-3xl font-black text-blue-700">
                      {new Set((destinations ?? []).map(d => d.country)).size}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-amber-600 mb-1">With Wildlife</p>
                    <p className="text-3xl font-black text-amber-700">
                      {(destinations ?? []).filter(d => d.wildlife_highlight).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <Trees className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-48 animate-pulse bg-gradient-to-br from-slate-100 to-slate-200" />
            </motion.div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="shadow-xl">
            <div className="p-20 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-4xl mb-6">
                <MapPin className="w-10 h-10 text-emerald-600" />
              </div>
              <h4 className="font-black text-xl text-slate-900 mb-2">No Destinations Found</h4>
              <p className="text-slate-500 text-sm font-medium max-w-sm">
                {search ? `No results for "${search}"` : 'Add your first safari destination to get started.'}
              </p>
            </div>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                      {dest.emoji}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(dest)}
                        className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all hover:scale-110"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(dest)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-1">{dest.name}</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{dest.country}</p>
                  {dest.area && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2 font-medium">
                      <Mountain className="w-3 h-3" />
                      {dest.area}
                    </div>
                  )}
                  {dest.wildlife_highlight && (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl px-3 py-2 mt-3">
                      <p className="text-xs font-bold text-emerald-700">🐾 {dest.wildlife_highlight}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b-2 border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
                <h3 className="font-black text-slate-900 text-xl">{editing ? 'Edit Destination' : 'Add Destination'}</h3>
                <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={e => { e.preventDefault(); editing ? updateMutation.mutate({ id: editing.id, data: form }) : createMutation.mutate(form); }} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Serengeti" />
                  <Field label="Country *" value={form.country} onChange={v => setForm(f => ({ ...f, country: v }))} placeholder="Tanzania" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Emoji *" value={form.emoji} onChange={v => setForm(f => ({ ...f, emoji: v }))} placeholder="🦁" />
                  <Field label="Area" value={form.area} onChange={v => setForm(f => ({ ...f, area: v }))} placeholder="14,763 km²" />
                </div>
                <Field label="Wildlife Highlight" value={form.wildlife_highlight} onChange={v => setForm(f => ({ ...f, wildlife_highlight: v }))} placeholder="Famous for the Great Migration" />
                <Field label="Fun Fact" value={form.fun_fact} onChange={v => setForm(f => ({ ...f, fun_fact: v }))} placeholder="Home to 1.5 million wildebeest..." textarea />
                <div className="flex items-center gap-4 pt-2">
                  <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                  <button
                    type="submit"
                    disabled={isSaving || !form.name || !form.country || !form.emoji}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 transition-all"
                  >
                    {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Add Destination'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 text-center"
            >
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Trash2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete {deleteTarget.name}?</h3>
              <p className="text-sm text-slate-600 font-medium mb-8">This destination will be removed from the platform.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 shadow-lg shadow-red-500/30 transition-all"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean;
}) {
  const cls = "w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all";
  return (
    <div>
      <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${cls} resize-none`} />
        : <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}
