/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Package, Plus, Search, Filter, MoreVertical, AlertCircle, CheckCircle2, Wrench, Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

const inventoryItems = [
  { id: 1, code: 'MON-001', name: 'Dell 24" Monitor', category: 'Peripheral', status: 'active', price: 0 },
  { id: 2, code: 'CPU-042', name: 'Lenovo ThinkCentre M70', category: 'Computing', status: 'defective', price: 2500 },
  { id: 3, code: 'CPU-012', name: 'Lenovo ThinkCentre M70', category: 'Computing', status: 'under_repair', price: 0 },
  { id: 4, code: 'UPS-005', name: 'APC Back-UPS 650VA', category: 'Power', status: 'active', price: 0 },
  { id: 5, code: 'LPT-001', name: 'MacBook Air M2', category: 'Computing', status: 'disposed', price: 15000 },
];

const statusStyles = {
  active: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Active' },
  defective: { icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Defective' },
  under_repair: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Repair' },
  disposed: { icon: Trash2, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Disposed' },
};

import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, handleFirestoreError, OperationType } from '@/src/context/AuthContext';

export default function Inventory() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<string | null>(null);

  // Form State
  const [newItem, setNewItem] = React.useState({
    name: '',
    category: 'Computer',
    status: 'active',
    price: 0
  });

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(itemsData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'inventory'));

    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') return;

    try {
      await addDoc(collection(db, 'inventory'), {
        code: `ITEM-${Math.floor(Math.random() * 9000) + 1000}`,
        ...newItem,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Computer', status: 'active', price: 0 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'inventory');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (user?.role !== 'admin') return;
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`);
      }
    }
  };


  const filteredItems = items.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesFilter;
  });

  const categories = Array.from(new Set(items.map((i: any) => i.category)));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">ICT Inventory</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5 tracking-wider">Campus equipment tracking and liability monitor</p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setShowAddModal(true)} size="sm" className="flex items-center gap-1.5 font-bold uppercase tracking-tight">
            <Plus className="w-3.5 h-3.5" />
            Add Item
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, name, category..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9 text-[10px] font-bold uppercase tracking-widest">
              <Filter className="w-3.5 h-3.5" />
              {filterCategory || 'Category'}
            </Button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg hidden group-hover:block z-50">
              {categories.map((c: any) => (
                <button 
                  key={c}
                  onClick={() => setFilterCategory(filterCategory === c ? null : c)}
                  className={cn("w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-slate-50 transition-colors", filterCategory === c && "text-orange-600 bg-orange-50")}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Code</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Item Name</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Category</th>
                <th className="py-2.5 px-4 text-[10px] font-bold uppercase tracking-widest">Status</th>
                <th className="py-2.5 px-4 text-right text-[10px] font-bold uppercase tracking-widest">Damage Fee</th>
                <th className="py-2.5 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? filteredItems.map((item, i) => {
                const status = statusStyles[item.status as keyof typeof statusStyles] || statusStyles.active;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <code className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.code}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-slate-700">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {item.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <status.icon className={cn('w-3 h-3', status.color)} />
                        <span className={cn('text-[10px] font-bold uppercase tracking-widest', status.color)}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-[10px] font-mono font-bold text-slate-600">
                      {item.price > 0 ? `₱${item.price.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user?.role === 'admin' && (
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Inventory database empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Operational items
            </h3>
            <p className="text-[10px] text-emerald-700 font-medium">
              {Math.round((items.filter((i: any) => i.status === 'active').length / items.length) * 100) || 0}% of inventory is functional.
            </p>
          </div>
          <span className="text-xl font-black text-emerald-600/20">92%</span>
        </div>
        
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-rose-900 uppercase tracking-widest flex items-center gap-2 mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Critical Liabilities
            </h3>
            <p className="text-[10px] text-rose-700 font-medium">
              Total pending damage fees: <span className="font-bold">₱{items.reduce((acc: number, item: any) => acc + (item.price || 0), 0).toLocaleString()}</span>
            </p>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-600/10" />
        </div>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Add Inventory Asset</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-900" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Item Name</label>
                  <input 
                    required
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g. Logitech Workspace Mouse"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</label>
                    <select 
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    >
                      <option>Computer</option>
                      <option>Peripheral</option>
                      <option>Networking</option>
                      <option>Furniture</option>
                      <option>AV Equipment</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Status</label>
                    <select 
                      value={newItem.status}
                      onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    >
                      <option value="active">Active</option>
                      <option value="borrowed">Borrowed</option>
                      <option value="defective">Defective</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Damage Fee (Liability)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₱</span>
                    <input 
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-11 text-[10px] font-black uppercase tracking-[0.2em] mt-4">
                  Register Asset
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
