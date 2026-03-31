import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download,
  MoreVertical, 
  Edit, 
  Trash2, 
  Building2, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Unit } from '@/types';
import { useUnits } from '@/features/units/hooks/useUnits';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { downloadCsv } from '@/lib/api/export';

const INITIAL_FORM = {
  propertyId: '',
  number: '',
  type: 'PENTHOUSE',
  rent: '',
  status: 'Vacant' as Unit['status'],
};

export const Units = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const { data: units, create, update, remove } = useUnits();
  const { data: properties } = useProperties();
  const { data: tenants } = useTenants();

  const filteredUnits = units.filter(u => {
    const property = properties.find(p => p.id === u.propertyId);
    const matchesSearch = u.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         property?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingUnit(null);
    setForm((prev) => ({ ...INITIAL_FORM, propertyId: properties[0]?.id || prev.propertyId }));
    setIsModalOpen(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setForm({
      propertyId: unit.propertyId,
      number: unit.number,
      type: unit.type,
      rent: String(unit.rent),
      status: unit.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.propertyId || !form.number) return;

    const payload = {
      propertyId: form.propertyId,
      number: form.number,
      type: form.type,
      rent: Number(form.rent || 0),
      status: form.status,
      tenantId: editingUnit?.tenantId,
    };

    if (editingUnit) {
      await update(editingUnit.id, payload);
    } else {
      await create(payload);
    }

    setIsModalOpen(false);
    setEditingUnit(null);
    setForm(INITIAL_FORM);
  };

  const openDeleteModal = (unit: Unit) => {
    setDeletingUnit(unit);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-screen-xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">Unit Registry</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-2">Manage individual asset components</p>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
        <div className="relative w-full lg:min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH BY UNIT OR PROPERTY..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-12 pr-4 py-3 text-[10px] uppercase tracking-widest"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-md overflow-x-auto custom-scrollbar">
          {['All', 'Occupied', 'Vacant', 'Maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-2 text-[9px] font-bold uppercase tracking-widest rounded transition-all ${
                filterStatus === status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button 
          onClick={() => void downloadCsv("units")}
          className="flex items-center gap-3 px-6 py-3 border border-border text-foreground rounded-md font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </button>
      </div>

      {/* Units Table */}
      <Table headers={['Unit ID', 'Property', 'Type', 'Monthly Rent', 'Status', 'Resident', 'Actions']}>
        <AnimatePresence mode="popLayout">
          {filteredUnits.map((unit) => {
            const property = properties.find(p => p.id === unit.propertyId);
            const tenant = tenants.find(t => t.id === unit.tenantId);
            
            return (
              <TableRow key={unit.id}>
                <TableCell className="font-bold text-primary">{unit.number}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-foreground font-bold">{property?.name}</span>
                    <span className="text-[9px] text-muted-foreground tracking-tighter">{property?.location}</span>
                  </div>
                </TableCell>
                <TableCell>{unit.type}</TableCell>
                <TableCell className="font-bold text-foreground">${unit.rent.toLocaleString()}</TableCell>
                <TableCell><StatusBadge status={unit.status} /></TableCell>
                <TableCell>
                  {tenant ? (
                    <div className="flex items-center gap-3">
                      <img src={tenant.avatar} className="w-8 h-8 rounded border border-border object-cover" alt="" />
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{tenant.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Available</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <button
                      className="p-2 text-muted-foreground hover:text-primary transition-all"
                      onClick={() => openEditModal(unit)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-muted-foreground hover:text-red-500 transition-all"
                      onClick={() => openDeleteModal(unit)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </AnimatePresence>
      </Table>

      {/* Add Unit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }} 
        title={editingUnit ? "Update Unit" : "Register New Unit"}
      >
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Property Assignment</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.propertyId}
                onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value }))}
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit Number/ID</label>
              <input 
                type="text" 
                placeholder="e.g. PH-03"
                value={form.number}
                onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit Type</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option>PENTHOUSE</option>
                <option>STUDIO</option>
                <option>1BR APARTMENT</option>
                <option>2BR APARTMENT</option>
                <option>3BR APARTMENT</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Rent (USD)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.rent}
                onChange={(e) => setForm((prev) => ({ ...prev, rent: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit Status</label>
            <div className="flex items-center gap-6">
              {['Vacant', 'Maintenance'].map((status) => (
                <label key={status} className="flex items-center gap-3 cursor-pointer group" onClick={() => setForm((prev) => ({ ...prev, status: status as Unit['status'] }))}>
                  <input type="radio" name="status" className="hidden" checked={form.status === status} readOnly />
                  <div className="w-5 h-5 border border-border rounded flex items-center justify-center group-hover:border-primary transition-all">
                    <div className={`w-2.5 h-2.5 bg-primary rounded-sm ${form.status === status ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{status}</span>
                </label>
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
              {editingUnit ? 'Save Unit' : 'Register Unit'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUnit(null);
        }}
        title="Delete Unit"
      >
        <div className="space-y-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            This will permanently remove unit <span className="text-foreground font-bold">{deletingUnit?.number}</span>.
          </p>
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingUnit(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
              onClick={async () => {
                if (!deletingUnit) return;
                await remove(deletingUnit.id);
                setIsDeleteModalOpen(false);
                setDeletingUnit(null);
              }}
            >
              Delete Unit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Units;
