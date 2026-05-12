/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users, Calendar as CalendarIcon, CheckCircle2, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

const facilities = [
  { id: '1', name: 'Computer Lab 1', type: 'comlab', capacity: 40 },
  { id: '2', name: 'Computer Lab 2', type: 'comlab', capacity: 35 },
  { id: '3', name: 'Audio Visual Room', type: 'avr', capacity: 100 },
];

const mockBookings = [
  { id: 'b1', facilityId: '1', date: new Date(), startTime: '08:00', endTime: '12:00', purpose: 'BSIT 3A Programming Class', status: 'approved' },
  { id: 'b2', facilityId: '2', date: new Date(), startTime: '13:00', endTime: '15:00', purpose: 'Faulty Meeting', status: 'pending' },
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

export default function Bookings() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);

  // Form state
  const [newBooking, setNewBooking] = React.useState({
    facilityId: '1',
    startTime: '08:00',
    endTime: '10:00',
    purpose: ''
  });

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          date: data.date ? new Date(data.date) : new Date() 
        };
      }));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));

    return () => unsub();
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        date: selectedDate.toISOString(),
        status: 'pending',
        userId: user?.uid,
        authorName: user?.displayName || user?.email,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNewBooking({ facilityId: '1', startTime: '08:00', endTime: '10:00', purpose: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };


  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Facility Bookings</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider tracking-tight">Schedule and manage Comlab and AVR reservations</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded p-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-50 rounded transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-50 rounded transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm" className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
            <Plus className="w-3.5 h-3.5" />
            New Booking
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-1 px-1">
        {days.map((day) => (
          <div key={day} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const bookingsForDay = bookings.filter((b: any) => isSameDay(b.date, cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              'h-24 sm:h-32 border-t border-r border-slate-100 p-1.5 transition-all cursor-pointer relative group',
              !isCurrentMonth && 'bg-slate-50/30',
              isSelected && 'bg-slate-100/50 ring-1 ring-inset ring-orange-500/10'
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={cn(
              'text-[10px] font-black w-6 h-6 flex items-center justify-center rounded',
              isSameDay(day, new Date()) ? 'bg-[#0F172A] text-white' : isCurrentMonth ? 'text-slate-600' : 'text-slate-300'
            )}>
              {format(day, 'd')}
            </span>
            <div className="mt-1 space-y-1 overflow-hidden">
              {bookingsForDay.slice(0, 3).map((b: any) => (
                <div key={b.id} className={cn(
                  'text-[8px] px-1 py-0.5 rounded border truncate font-black uppercase tracking-tighter shadow-sm',
                  b.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                )}>
                  {b.startTime} {b.purpose}
                </div>
              ))}
              {bookingsForDay.length > 3 && (
                <div className="text-[8px] font-bold text-slate-400 pl-1">
                  +{bookingsForDay.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="border-l border-slate-100 rounded-lg overflow-hidden shadow-sm bg-white">{rows}</div>;
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {renderHeader()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {renderDays()}
          {renderCells()}
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-orange-500" />
                Schedules: {format(selectedDate, 'MMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {bookings.filter((b: any) => isSameDay(b.date, selectedDate)).length > 0 ? (
                  bookings.filter((b: any) => isSameDay(b.date, selectedDate)).map((booking: any) => (
                    <div key={booking.id} className="p-3 rounded border border-slate-100 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border',
                          booking.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        )}>
                          {booking.status}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase">
                          <Clock className="w-3 h-3" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 leading-tight">{booking.purpose}</p>
                        <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-bold uppercase tracking-tight">
                          <MapPin className="w-3 h-3" />
                          {facilities.find(f => f.id === booking.facilityId)?.name}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available for reservation</p>
                  </div>
                )}
                
                <Button onClick={() => setShowModal(true)} className="w-full h-9 text-[10px] font-bold uppercase tracking-widest mt-2" variant="outline">
                  Book this date
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="bg-[#0F172A] p-4 rounded-lg text-white relative overflow-hidden">
             <div className="relative z-10">
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Utilization Stats
              </h4>
              <div className="space-y-2 mt-4">
                {facilities.map(f => (
                  <div key={f.id} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold uppercase">
                      <span className="text-slate-400">{f.name}</span>
                      <span>{Math.floor(Math.random() * 40) + 40}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
             </div>
             <Users className="absolute -bottom-4 -right-4 w-20 h-20 text-white/5" />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
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
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">New Reservation Request</h3>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                </button>
              </div>
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Facility</label>
                  <select 
                    value={newBooking.facilityId}
                    onChange={(e) => setNewBooking({...newBooking, facilityId: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Date Selected</label>
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-xs text-slate-500 font-bold uppercase">
                      {format(selectedDate, 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Time Window</label>
                    <div className="grid grid-cols-2 gap-1">
                       <input 
                        type="time"
                        value={newBooking.startTime}
                        onChange={(e) => setNewBooking({...newBooking, startTime: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                       />
                       <input 
                        type="time"
                        value={newBooking.endTime}
                        onChange={(e) => setNewBooking({...newBooking, endTime: e.target.value})}
                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                       />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Event/Class Purpose</label>
                    <textarea 
                      required
                      value={newBooking.purpose}
                      onChange={(e) => setNewBooking({...newBooking, purpose: e.target.value})}
                      placeholder="e.g. IT Finals Hands-on Exam"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 min-h-[80px]"
                    />
                </div>
                <Button type="submit" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] mt-4 shadow-lg shadow-orange-500/10">
                  Request Access
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
