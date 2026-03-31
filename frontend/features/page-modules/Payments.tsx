import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  Building2,
  User,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Payment } from '@/types';
import { cn } from '@/lib/utils';
import { usePayments } from '@/features/payments/hooks/usePayments';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { downloadCsv } from '@/lib/api/export';

const INITIAL_FORM = {
  tenantId: '',
  propertyId: '',
  amount: '',
  date: '',
  method: 'Bank Transfer',
  status: 'Paid' as Payment['status'],
};

export const Payments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editForm, setEditForm] = useState({
    tenantId: '',
    propertyId: '',
    amount: '',
    date: '',
    method: 'Bank Transfer',
    status: 'Paid' as Payment['status'],
  });
  const { data: payments, create, update, remove } = usePayments();
  const { data: tenants } = useTenants();
  const { data: properties } = useProperties();

  const filteredPayments = payments.filter(p => {
    const tenant = tenants.find(t => t.id === p.tenantId);
    const property = properties.find(prop => prop.id === p.propertyId);
    const matchesSearch = tenant?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         property?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);
  const delinquentBalance = payments.filter((p) => p.status === 'Late').reduce((acc, p) => acc + p.amount, 0);

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.tenantId || !form.amount) return;

    const tenant = tenants.find((item) => item.id === form.tenantId);
    await create({
      tenantId: form.tenantId,
      propertyId: form.propertyId || tenant?.propertyId || '',
      amount: Number(form.amount || 0),
      date: form.date || new Date().toISOString().slice(0, 10),
      status: form.status,
      method: form.method,
      description: `${form.date || 'Current'} Rent`,
    });

    setForm(INITIAL_FORM);
    setIsModalOpen(false);
  };

  const openEditModal = () => {
    if (!selectedPayment) return;
    setEditForm({
      tenantId: selectedPayment.tenantId,
      propertyId: selectedPayment.propertyId,
      amount: String(selectedPayment.amount),
      date: selectedPayment.date,
      method: selectedPayment.method,
      status: selectedPayment.status,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-screen-xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">Financial Ledger</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-3">Elite Transaction & Revenue Tracking</p>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6">
        <div className="relative flex-1 md:w-80 xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH TRANSACTIONS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-12 pr-4 py-3.5 text-[10px] uppercase tracking-widest"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded overflow-x-auto custom-scrollbar">
          {['All', 'Paid', 'Pending', 'Late'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                "px-4 lg:px-6 py-2.5 text-[8px] lg:text-[9px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap",
                filterStatus === status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <button 
          onClick={() => void downloadCsv("payments")}
          className="flex items-center justify-center gap-3 px-6 py-3.5 border border-border text-foreground rounded-md font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Record Payment</span>
          <span className="sm:hidden">Record</span>
        </button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 bg-primary/10 rounded text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">+12.5% VS LAST MONTH</span>
          </div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2">Total Collected</h3>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 bg-amber-500/10 rounded text-amber-500 group-hover:bg-amber-500 group-hover:text-primary-foreground transition-all">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">DUE WITHIN 7 DAYS</span>
          </div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2">Pending Revenue</h3>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">${pendingRevenue.toLocaleString()}</p>
        </div>
        <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <div className="p-3 bg-red-500/10 rounded text-red-500 group-hover:bg-red-500 group-hover:text-primary-foreground transition-all">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">{payments.filter((p) => p.status === 'Late').length} OVERDUE PAYMENTS</span>
          </div>
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-2">Delinquent Balance</h3>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">${delinquentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 custom-scrollbar">
        <Table headers={['Transaction ID', 'Resident', 'Asset', 'Amount', 'Date', 'Status', 'Actions']}>
          <AnimatePresence mode="popLayout">
            {filteredPayments.map((payment) => {
              const tenant = tenants.find(t => t.id === payment.tenantId);
              const property = properties.find(prop => prop.id === payment.propertyId);
              
              return (
                <TableRow key={payment.id} onClick={() => setSelectedPayment(payment)}>
                  <TableCell className="font-bold text-primary text-[9px] sm:text-[10px]">#{payment.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img src={tenant?.avatar} className="w-6 h-6 sm:w-8 sm:h-8 rounded border border-border object-cover" alt="" />
                      <span className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">{tenant?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] sm:text-xs text-foreground font-bold truncate max-w-[100px] sm:max-w-none">{property?.name}</span>
                  </TableCell>
                  <TableCell className="font-bold text-foreground text-[10px] sm:text-xs">${payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-[9px] sm:text-[10px]">{payment.date}</TableCell>
                  <TableCell><StatusBadge status={payment.status} /></TableCell>
                  <TableCell>
                    <button
                      className="p-2 text-muted-foreground hover:text-primary transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingPayment(payment);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </AnimatePresence>
        </Table>
      </div>

      {/* Payment Details Modal */}
      <Modal 
        isOpen={!!selectedPayment} 
        onClose={() => setSelectedPayment(null)} 
        title="Transaction Details"
      >
        {selectedPayment && (
          <div className="space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 bg-card rounded-md border border-border gap-4">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Amount Received</h3>
                <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">${selectedPayment.amount.toLocaleString()}</p>
              </div>
              <div className="text-right space-y-2">
                <StatusBadge status={selectedPayment.status} />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">TRANSACTION ID: #{selectedPayment.id.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" /> Resident
                  </h4>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {tenants.find(t => t.id === selectedPayment.tenantId)?.name}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-primary" /> Asset
                  </h4>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {properties.find(p => p.id === selectedPayment.propertyId)?.name}
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary" /> Date
                  </h4>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">{selectedPayment.date}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3 h-3 text-primary" /> Method
                  </h4>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">{selectedPayment.method}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card border border-border rounded space-y-4">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Invoice Preview</h4>
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded text-primary">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">INV-2024-03-015</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">PDF DOCUMENT • 1.2 MB</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Download</button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-6 border-t border-border">
              <button
                className="px-8 py-3 border border-border text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded"
                onClick={openEditModal}
              >
                Edit Transaction
              </button>
              <button
                className="px-8 py-3 border border-border text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded"
                onClick={async () => {
                  const updated = await update(selectedPayment.id, { status: 'Paid' });
                  if (updated) setSelectedPayment(updated);
                }}
              >
                Mark Paid
              </button>
              <button
                className="px-10 py-3 bg-primary text-primary-foreground rounded font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
                onClick={async () => {
                  const updated = await update(selectedPayment.id, { status: 'Pending' });
                  if (updated) setSelectedPayment(updated);
                }}
              >
                Mark Pending
              </button>
              <button
                className="px-10 py-3 bg-primary text-primary-foreground rounded font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
                onClick={() => {
                  setDeletingPayment(selectedPayment);
                  setIsDeleteModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transaction"
      >
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedPayment) return;
            const updated = await update(selectedPayment.id, {
              tenantId: editForm.tenantId,
              propertyId: editForm.propertyId,
              amount: Number(editForm.amount || 0),
              date: editForm.date,
              method: editForm.method,
              status: editForm.status,
            });
            if (updated) setSelectedPayment(updated);
            setIsEditModalOpen(false);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resident</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={editForm.tenantId}
                onChange={(e) => {
                  const tenant = tenants.find((item) => item.id === e.target.value);
                  setEditForm((prev) => ({ ...prev, tenantId: e.target.value, propertyId: tenant?.propertyId || prev.propertyId }));
                }}
              >
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={editForm.propertyId}
                onChange={(e) => setEditForm((prev) => ({ ...prev, propertyId: e.target.value }))}
              >
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</label>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Method</label>
              <input
                type="text"
                value={editForm.method}
                onChange={(e) => setEditForm((prev) => ({ ...prev, method: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as Payment['status'] }))}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPayment(null);
        }}
        title="Delete Transaction"
      >
        <div className="space-y-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Delete payment record <span className="text-foreground font-bold">#{deletingPayment?.id?.slice(0, 8).toUpperCase()}</span>?
          </p>
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingPayment(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
              onClick={async () => {
                if (!deletingPayment) return;
                await remove(deletingPayment.id);
                if (selectedPayment?.id === deletingPayment.id) {
                  setSelectedPayment(null);
                }
                setIsDeleteModalOpen(false);
                setDeletingPayment(null);
              }}
            >
              Delete Transaction
            </button>
          </div>
        </div>
      </Modal>

      {/* Record Payment Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setForm(INITIAL_FORM);
        }} 
        title="Record Elite Transaction"
      >
        <form className="space-y-8" onSubmit={handleCreatePayment}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resident</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.tenantId}
                onChange={(e) => {
                  const tenant = tenants.find((item) => item.id === e.target.value);
                  setForm((prev) => ({ ...prev, tenantId: e.target.value, propertyId: tenant?.propertyId || prev.propertyId }));
                }}
              >
                <option value="">SELECT RESIDENT...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.propertyId}
                onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value }))}
              >
                <option value="">SELECT ASSET...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount (USD)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Date</label>
              <input 
                type="date" 
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Bank Transfer', 'Credit Card', 'Crypto'].map((method) => (
                <label key={method} className="flex flex-col items-center gap-3 p-4 border border-border rounded cursor-pointer hover:border-primary transition-all group">
                  <input
                    type="radio"
                    name="method"
                    className="hidden"
                    checked={form.method === method}
                    onChange={() => setForm((prev) => ({ ...prev, method }))}
                  />
                  <CreditCard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">{method}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payment Status</label>
            <div className="flex items-center gap-4">
              {['Paid', 'Pending', 'Late'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded border ${form.status === status ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}
                  onClick={() => setForm((prev) => ({ ...prev, status: status as Payment['status'] }))}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-6 border-t border-border">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
            >
              Record Transaction
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;
