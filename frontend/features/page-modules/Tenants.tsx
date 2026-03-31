import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { Tenant } from '@/types';
import { cn } from '@/lib/utils';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { useUnits } from '@/features/units/hooks/useUnits';
import { downloadCsv } from '@/lib/api/export';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  propertyId: '',
  unitId: '',
  leaseStart: '',
  leaseEnd: '',
};

export const Tenants = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const { data: tenants, create, update, remove } = useTenants();
  const { data: properties } = useProperties();
  const { data: units } = useUnits();

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableUnits = units.filter((unit) => {
    if (form.propertyId && unit.propertyId !== form.propertyId) return false;
    const hasTenant = tenants.some((tenant) => tenant.unitId === unit.id);
    return !hasTenant || unit.id === form.unitId;
  });

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.unitId || !form.propertyId) return;

    const selectedUnit = units.find((unit) => unit.id === form.unitId);
    await create({
      name: form.name,
      email: form.email,
      phone: form.phone || '-',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      propertyId: form.propertyId,
      unitId: form.unitId,
      leaseStart: form.leaseStart || new Date().toISOString().slice(0, 10),
      leaseEnd: form.leaseEnd || new Date().toISOString().slice(0, 10),
      balance: selectedUnit?.rent ?? 0,
      status: 'Active',
    });
    setForm(INITIAL_FORM);
    setIsModalOpen(false);
  };

  const openEditModal = () => {
    if (!selectedTenant) return;
    setEditForm({
      name: selectedTenant.name,
      email: selectedTenant.email,
      phone: selectedTenant.phone,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">Resident Registry</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-3">Elite community management</p>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6">
        <div className="relative flex-1 md:w-80 xl:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH RESIDENTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-12 pr-4 py-3.5 text-[10px] uppercase tracking-widest"
          />
        </div>
        <button 
          onClick={() => void downloadCsv("tenants")}
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
          <span className="hidden sm:inline">Invite Resident</span>
          <span className="sm:hidden">Invite</span>
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredTenants.map((tenant) => {
            const property = properties.find(p => p.id === tenant.propertyId);
            const unit = units.find(u => u.id === tenant.unitId);
            
            return (
              <motion.div
                key={tenant.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedTenant(tenant)}
                className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-5 sm:gap-6 mb-6 sm:mb-8">
                  <div className="relative">
                    <img src={tenant.avatar} className="w-14 h-14 sm:w-16 sm:h-16 rounded border border-border group-hover:border-primary transition-all object-cover" alt="" />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card",
                      tenant.balance > 0 ? "bg-red-500" : "bg-emerald-500"
                    )} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wider">{tenant.name}</h4>
                    <p className="text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-widest mt-1">UNIT {unit?.number} • {property?.name}</p>
                  </div>
                </div>
                
                <div className="space-y-4 py-4 sm:py-6 border-y border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Lease Term</span>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{tenant.leaseStart} - {tenant.leaseEnd}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Current Balance</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest", tenant.balance > 0 ? "text-red-500" : "text-emerald-500")}>
                      ${tenant.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6 sm:mt-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary rounded text-muted-foreground group-hover:text-primary transition-all">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="p-2 bg-secondary rounded text-muted-foreground group-hover:text-primary transition-all">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <button className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-all flex items-center gap-2">
                    View Profile
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Tenant Profile Modal */}
      <Modal 
        isOpen={!!selectedTenant} 
        onClose={() => setSelectedTenant(null)} 
        title="Resident Profile"
      >
        {selectedTenant && (
          <div className="space-y-6 sm:space-y-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 text-center sm:text-left">
              <img src={selectedTenant.avatar} className="w-20 h-20 sm:w-24 sm:h-24 rounded border border-primary/30 p-1 object-cover" alt="" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground uppercase tracking-wider">{selectedTenant.name}</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mt-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-3 h-3 text-primary" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">{selectedTenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3 h-3 text-primary" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest">{selectedTenant.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="bg-card p-4 sm:p-6 rounded border border-border space-y-4">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Lease Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest">Property</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest">
                      {properties.find(p => p.id === selectedTenant.propertyId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest">Unit</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest">
                      {units.find(u => u.id === selectedTenant.unitId)?.number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Term</span>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      {selectedTenant.leaseStart} - {selectedTenant.leaseEnd}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded border border-border space-y-4">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Financial Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Monthly Rent</span>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                      ${(units.find(u => u.id === selectedTenant.unitId)?.rent ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Current Balance</span>
                    <span className={selectedTenant.balance > 0 ? "text-red-500 font-bold" : "text-emerald-500 font-bold"}>
                      ${selectedTenant.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Security Deposit</span>
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">$50,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Recent Activity</h3>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-card border border-border rounded">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded text-primary">
                        <CreditCard className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Rent Payment Received</p>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">MARCH 2024 • BANK TRANSFER</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500">+$25,000</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 pt-6 border-t border-border">
              <button
                className="px-8 py-3 border border-border text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded"
                onClick={openEditModal}
              >
                Edit Profile
              </button>
              <button
                className="px-10 py-3 bg-primary text-primary-foreground rounded font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Remove Resident
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Resident Profile"
      >
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedTenant) return;
            const updated = await update(selectedTenant.id, {
              name: editForm.name,
              email: editForm.email,
              phone: editForm.phone,
            });
            if (updated) setSelectedTenant(updated);
            setIsEditModalOpen(false);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
            />
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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Resident"
      >
        <div className="space-y-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            This will remove <span className="text-foreground font-bold">{selectedTenant?.name}</span> and related assignments.
          </p>
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
              onClick={async () => {
                if (!selectedTenant) return;
                await remove(selectedTenant.id);
                setIsDeleteModalOpen(false);
                setSelectedTenant(null);
              }}
            >
              Remove Resident
            </button>
          </div>
        </div>
      </Modal>

      {/* Invite Resident Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setForm(INITIAL_FORM);
        }} 
        title="Invite Elite Resident"
      >
        <form className="space-y-8" onSubmit={handleCreateTenant}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Julian Sterling"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. julian@elite.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Assignment</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.propertyId}
                onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value, unitId: '' }))}
              >
                <option value="">SELECT ASSET...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit Assignment</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.unitId}
                onChange={(e) => setForm((prev) => ({ ...prev, unitId: e.target.value }))}
              >
                <option value="">SELECT UNIT...</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.number} ({unit.status})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lease Start</label>
              <input 
                type="date" 
                value={form.leaseStart}
                onChange={(e) => setForm((prev) => ({ ...prev, leaseStart: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lease End</label>
              <input 
                type="date" 
                value={form.leaseEnd}
                onChange={(e) => setForm((prev) => ({ ...prev, leaseEnd: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-6 border-t border-border">
            <button 
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setForm(INITIAL_FORM);
              }}
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tenants;
