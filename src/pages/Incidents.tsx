/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertTriangle, User, Calendar, DollarSign, CheckCircle2, AlertCircle, FileText, ArrowRight, History, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

const incidents = [
  { 
    id: 'INC-2024-001', 
    user: 'Juan Dela Cruz', 
    item: 'LPT-042 (Laptop)', 
    description: 'Screen crack due to accidental fall during class.', 
    amount: 7500, 
    deadline: '2024-05-30', 
    status: 'unresolved' 
  },
  { 
    id: 'INC-2024-002', 
    user: 'Maria Clara', 
    item: 'MON-012 (Monitor)', 
    description: 'Keyboard damage and missing mouse.', 
    amount: 1200, 
    deadline: '2024-05-15', 
    status: 'unresolved' 
  },
  { 
    id: 'INC-2023-085', 
    user: 'Andres Bonifacio', 
    item: 'UPS-001 (UPS)', 
    description: 'Battery replacement after power surge improper shutdown.', 
    amount: 2800, 
    deadline: '2023-12-12', 
    status: 'resolved' 
  },
];

import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, handleFirestoreError, OperationType } from '@/src/context/AuthContext';

export default function Incidents() {
  const { user } = useAuth();
  const [incidentList, setIncidentList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Form State
  const [newIncident, setNewIncident] = React.useState({
    user: '',
    item: '',
    description: '',
    amount: 0,
    deadline: format(addDays(new Date(), 14), 'yyyy-MM-dd')
  });

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      setIncidentList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'incidents'));

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') return;

    try {
      await addDoc(collection(db, 'incidents'), {
        ...newIncident,
        status: 'unresolved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowModal(false);
      setNewIncident({
        user: '',
        item: '',
        description: '',
        amount: 0,
        deadline: format(addDays(new Date(), 14), 'yyyy-MM-dd')
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'incidents');
    }
  };

  const resolveCase = async (id: string) => {
    if (user?.role !== 'admin') return;
    if (confirm('Mark this incident as resolved? This assumes liability has been cleared.')) {
      try {
        await updateDoc(doc(db, 'incidents', id), {
          status: 'resolved',
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `incidents/${id}`);
      }
    }
  };


  const filteredIncidents = incidentList.filter((inc: any) => 
    inc.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLiabilities = incidentList
    .filter((inc: any) => inc.status === 'unresolved')
    .reduce((acc: number, inc: any) => acc + inc.amount, 0);

  const unresolvedCount = incidentList.filter((inc: any) => inc.status === 'unresolved').length;
  const resolvedCount = incidentList.filter((inc: any) => inc.status === 'resolved').length;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Incident Records</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider">Track liabilities, damages, and user accountability</p>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 font-bold uppercase tracking-tight bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Incident
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Total Liabilities</p>
            <p className="text-xl font-black text-rose-600 mt-1">₱{totalLiabilities.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-rose-600/10" />
        </div>
        
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Unresolved Cases</p>
            <p className="text-xl font-black text-amber-600 mt-1">{unresolvedCount}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-amber-600/10" />
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Resolved Cases</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{resolvedCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600/10" />
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative flex-1">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter records by name, item, or case ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all font-medium"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredIncidents.length > 0 ? filteredIncidents.map((incident: any, i: number) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={cn(
              'overflow-hidden transition-all border border-slate-200 rounded-lg bg-white shadow-sm flex flex-col md:flex-row',
              incident.status === 'unresolved' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
            )}>
              <div className="p-4 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-mono font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {incident.id}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border',
                    incident.status === 'unresolved' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  )}>
                    {incident.status}
                  </span>
                </div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-tight">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {incident.user}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                  <FileText className="w-3.5 h-3.5 text-slate-300" />
                  {incident.item}
                </p>
                <div className="mt-3 text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100 font-medium leading-relaxed">
                  {incident.description}
                </div>
              </div>

              <div className={cn(
                'p-4 md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100',
                incident.status === 'unresolved' ? 'bg-rose-50/20' : 'bg-slate-50/50'
              )}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Liability</span>
                    <span className="text-sm font-black text-rose-600">₱{incident.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Deadline</span>
                    <span className="text-[10px] font-black text-slate-700 flex items-center gap-1 uppercase">
                      <Calendar className="w-3 h-3" />
                      {incident.deadline}
                    </span>
                  </div>
                </div>
                {incident.status === 'unresolved' && user?.role === 'admin' && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button onClick={() => resolveCase(incident.id)} className="w-full text-[9px] font-black uppercase tracking-widest h-8" size="sm">
                      Mark as Resolved
                    </Button>
                    <Button variant="ghost" className="w-full text-[9px] font-black uppercase tracking-widest h-8 group" size="sm">
                      View Log
                      <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="py-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            No incident reports found in the Management and Information System archive
          </div>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Incident Intake Report</h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Accountability Name</label>
                    <input 
                      required
                      type="text"
                      value={newIncident.user}
                      onChange={(e) => setNewIncident({...newIncident, user: e.target.value})}
                      placeholder="Student/Faculty Name"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inventory Label/Code</label>
                    <input 
                      required
                      type="text"
                      value={newIncident.item}
                      onChange={(e) => setNewIncident({...newIncident, item: e.target.value})}
                      placeholder="e.g. LPT-042"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detailed Case Description</label>
                  <textarea 
                    required
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                    placeholder="Describe the damage, missing components, or improper use..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Liability Fee (₱)</label>
                    <input 
                      type="number"
                      required
                      value={newIncident.amount}
                      onChange={(e) => setNewIncident({...newIncident, amount: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resolution Deadline</label>
                    <input 
                      type="date"
                      required
                      value={newIncident.deadline}
                      onChange={(e) => setNewIncident({...newIncident, deadline: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] mt-4 shadow-lg shadow-orange-500/10">
                  Register Incident
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { format, addDays } from 'date-fns';
