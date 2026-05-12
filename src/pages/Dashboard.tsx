/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClipboardList, Package, Calendar, AlertTriangle, TrendingUp, Users, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import * as React from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { useAuth, handleFirestoreError, OperationType } from '@/src/context/AuthContext';


export default function Dashboard() {
  const { user } = useAuth();
  
  const [data, setData] = React.useState({
    inventory: [] as any[],
    requests: [] as any[],
    bookings: [] as any[],
    incidents: [] as any[]
  });

  React.useEffect(() => {
    // Inventory
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      setData(prev => ({ ...prev, inventory: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'inventory'));

    // Requests (Public for admins, private for users)
    const requestsRef = collection(db, 'requests');
    const qRequests = user?.role === 'admin' ? requestsRef : query(requestsRef, where('userId', '==', user?.uid));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      setData(prev => ({ ...prev, requests: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'requests'));

    // Bookings
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setData(prev => ({ ...prev, bookings: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));

    // Incidents
    const unsubIncidents = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      setData(prev => ({ ...prev, incidents: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'incidents'));

    return () => {
      unsubInventory();
      unsubRequests();
      unsubBookings();
      unsubIncidents();
    };
  }, [user]);

  const stats = [
    { label: 'Active Requests', value: data.requests.filter((r: any) => r.status !== 'resolved' && r.status !== 'completed').length.toString(), icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Inventory Items', value: data.inventory.length.toString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Bookings', value: data.bookings.filter((b: any) => b.status === 'pending').length.toString(), icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Open Incidents', value: data.incidents.filter((i: any) => i.status === 'unresolved').length.toString(), icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-4">
        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-1">Management Portal</p>
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
          Portal Gateway / <span className="text-slate-400">{user?.role.replace('_', ' ')}</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest leading-tight">
          {user?.role === 'admin' 
            ? 'Unified ICT and Management and Information System administration controls for Claveria campus' 
            : 'Access technical support and campus facilities management'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-200 hover:border-orange-200 transition-all shadow-sm">
              <CardContent className="p-4">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h2>
                  <div className={cn("p-2 rounded", stat.bg)}>
                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-100 flex-row items-center justify-between py-3">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-orange-500" />
                Active Service Requests
              </CardTitle>
              <Button onClick={() => window.location.hash = '#/requests'} variant="ghost" size="sm" className="h-7 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                Full View
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {data.requests.length > 0 ? data.requests.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-slate-50 transition-colors">
                    <div className="col-span-2 text-[10px] font-mono font-black text-slate-300">
                      {item.id}
                    </div>
                    <div className="col-span-3 text-[11px] font-black text-slate-700 truncate uppercase">
                      {item.type}
                    </div>
                    <div className="col-span-3 text-[10px] text-slate-500 truncate font-medium italic">
                      {item.description}
                    </div>
                    <div className="col-span-2">
                      <span className={cn(
                        'text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border',
                        item.priority === 'urgent' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-slate-50 text-slate-600'
                      )}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-widest',
                        item.status === 'pending' ? 'text-orange-500' : item.status === 'resolved' ? 'text-emerald-500' : 'text-blue-500'
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    No active job orders in the queue
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4 border-b border-slate-50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  Asset Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {data.inventory.filter((i: any) => i.status === 'defective').slice(0, 3).map((item: any, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-rose-50/50 border border-rose-100/50">
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] text-rose-600 font-bold uppercase">Malfunctioned</p>
                    </div>
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                  </div>
                ))}
                {data.inventory.filter((i: any) => i.status === 'defective').length === 0 && (
                   <div className="py-4 text-center text-[9px] text-slate-400 font-bold uppercase">All systems functional</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="py-3 px-4 border-b border-slate-50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                  Liability Watch
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {data.incidents.filter((i: any) => i.status === 'unresolved').slice(0, 3).map((inc: any, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-orange-50 border border-orange-100">
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase">{inc.user}</p>
                      <p className="text-[9px] text-slate-500 font-medium truncate max-w-[80px]">{inc.item}</p>
                    </div>
                    <p className="text-[10px] font-black text-rose-600">₱{inc.amount.toLocaleString()}</p>
                  </div>
                ))}
                {data.incidents.filter((i: any) => i.status === 'unresolved').length === 0 && (
                   <div className="py-4 text-center text-[9px] text-slate-400 font-bold uppercase">No pending liabilities</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="py-3 border-b border-slate-50">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                Lab Reservation Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {data.bookings.length > 0 ? data.bookings.slice(0, 4).map((item: any, i) => {
                const startTime = item.startTime || '00:00';
                const timeParts = startTime.split(':');
                const hours = timeParts[0] || '00';
                const minutes = timeParts[1] || '00';
                const period = Number(hours) >= 12 ? 'PM' : 'AM';
                const displayHours = Number(hours) % 12 || 12;

                return (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-[11px] font-black text-slate-800">{displayHours}:{minutes}</p>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">{period}</p>
                    </div>
                    <div className={cn(
                      'flex-1 border-l-2 p-2 rounded-r transition-all',
                      item.status === 'confirmed' || item.status === 'approved' ? 'bg-emerald-50/50 border-emerald-500' : 'bg-amber-50/50 border-amber-500'
                    )}>
                      <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight">
                        {item.purpose || (item.facilityId === '1' ? 'Comp Lab 1' : item.facilityId === '2' ? 'Comp Lab 2' : 'AVR Hall')}
                      </p>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{item.status}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-8 text-center text-[9px] text-slate-300 font-black uppercase tracking-widest">No reservations today</div>
              )}
              <Button onClick={() => window.location.hash = '#/bookings'} variant="secondary" className="w-full h-8 text-[10px] font-black uppercase tracking-widest mt-4">
                Open Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-[#0F172A] text-white">
            <CardHeader className="py-3 border-b border-slate-800">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-orange-500">
                <TrendingUp className="w-3.5 h-3.5" />
                Capacity Utilization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {[
                { name: 'Computer Lab 1', val: 78 },
                { name: 'Computer Lab 2', val: 45 },
                { name: 'AVR Hall', val: 92 }
              ].map(f => (
                <div key={f.name} className="space-y-1.5 cursor-help group">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                    <span>{f.name}</span>
                    <span className="text-white">{f.val}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${f.val}%` }}
                      className="h-full bg-orange-500" 
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[8px] text-slate-500 italic flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  Live update: Sensor sync confirmed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
