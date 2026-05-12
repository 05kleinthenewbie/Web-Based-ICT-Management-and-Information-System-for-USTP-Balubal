/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClipboardList, Plus, Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

const mockRequests = [
  { id: 'R-001', type: 'Technical Support', description: 'Monitor flickering in Comlab 1 Row 2', status: 'pending', priority: 'medium', createdAt: '2024-05-12T08:30:00Z', updates: 2 },
  { id: 'R-002', type: 'Account Access', description: 'Staff email password reset request', status: 'approved', priority: 'high', createdAt: '2024-05-11T14:20:00Z', updates: 1 },
  { id: 'R-003', type: 'Equipment Request', description: 'Projector for AVR 1 Seminar', status: 'completed', priority: 'low', createdAt: '2024-05-10T10:00:00Z', updates: 4 },
  { id: 'R-004', type: 'Network Issue', description: 'No internet connection in Faculty Room', status: 'rejected', priority: 'urgent', createdAt: '2024-05-12T09:15:00Z', updates: 0 },
];

const priorityStyles = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Approved' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  rejected: { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Rejected' },
};

import { 
  collection, 
  query, 
  onSnapshot, 
  where, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, handleFirestoreError, OperationType } from '@/src/context/AuthContext';

export default function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null);

  // Form State
  const [newRequest, setNewRequest] = React.useState({
    type: 'Technical Support',
    description: '',
    priority: 'medium'
  });

  React.useEffect(() => {
    const requestsRef = collection(db, 'requests');
    const q = user?.role === 'admin' ? requestsRef : query(requestsRef, where('userId', '==', user?.uid));
    
    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'requests'));

    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'requests'), {
        ...newRequest,
        status: 'pending',
        userId: user?.uid,
        authorName: user?.displayName || user?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updates: 0
      });
      setShowNewRequestForm(false);
      setNewRequest({ type: 'Technical Support', description: '', priority: 'medium' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    }
  };


  const filteredRequests = requests.filter((r: any) => {
    const matchesSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterPriority ? r.priority === filterPriority : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Service Requests</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider">Submit and track your ICT service and support requests</p>
        </div>
        <Button onClick={() => setShowNewRequestForm(true)} size="sm" className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
          <Plus className="w-3.5 h-3.5" />
          Submit Request
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ID, description, or type..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all shadow-sm placeholder:text-slate-300"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-widest">
              <Filter className="w-3.5 h-3.5" />
              {filterPriority || 'Priority'}
            </Button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded shadow-lg hidden group-hover:block z-50">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <button 
                  key={p}
                  onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                  className={cn("w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-slate-50 transition-colors", filterPriority === p && "text-orange-600 bg-orange-50")}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Request ID</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Type</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Description</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Priority</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                <th className="py-2.5 px-4 text-right text-[10px] font-bold uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? filteredRequests.map((request: any) => {
                const status = statusConfig[request.status as keyof typeof statusConfig];
                return (
                  <tr key={request.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="py-3 px-4 text-[10px] font-mono font-bold text-slate-400">
                      {request.id}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-700">
                      {request.type}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {request.description}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', 
                        request.priority === 'urgent' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                        request.priority === 'high' ? 'border-orange-200 bg-orange-50 text-orange-700' :
                        'border-slate-200 bg-slate-50 text-slate-600'
                      )}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <status.icon className={cn('w-3 h-3', status.color)} />
                        <span className={cn('text-[10px] font-bold uppercase tracking-widest', status.color)}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold text-orange-600 hover:text-orange-700 uppercase">
                        Details
                      </Button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    No matching requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#0F172A] rounded-lg p-6 relative overflow-hidden text-white shadow-xl shadow-slate-200/50">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">Automated Management and Information System</h2>
          <h3 className="text-xl font-bold tracking-tight">Technical Assistance Monitor</h3>
          <p className="mt-3 text-[11px] text-slate-400 leading-relaxed font-medium">
            Our job order system ensures requests are assigned instantly upon approval. 
            Technicians are notified via SMS/Email for urgent priorities.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded border border-slate-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Live Status Sync</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded border border-slate-700/50">
              <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">SLA Enforcement</span>
            </div>
          </div>
        </div>
        <ClipboardList className="absolute -bottom-8 -right-8 w-48 h-48 text-white/5 rotate-12" />
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewRequestForm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">New Service Request</h3>
                <button onClick={() => setShowNewRequestForm(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Request Type</label>
                  <select 
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                  >
                    <option>Technical Support</option>
                    <option>Account Access</option>
                    <option>Equipment Request</option>
                    <option>Network Issue</option>
                    <option>Software Installation</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description</label>
                  <textarea 
                    required
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    placeholder="Describe the issue in detail..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 min-h-[100px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Priority Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewRequest({...newRequest, priority: p})}
                        className={cn(
                          "px-2 py-2 text-[8px] font-black uppercase tracking-widest border-2 rounded transition-all",
                          newRequest.priority === p 
                            ? "bg-[#0F172A] border-[#0F172A] text-white"
                            : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] mt-4">
                  Create Job Order
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
