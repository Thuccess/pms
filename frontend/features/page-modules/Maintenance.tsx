import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Download,
  Wrench, 
  User, 
  Calendar,
  ChevronRight,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MaintenanceRequest } from '@/types';
import { cn } from '@/lib/utils';
import { useMaintenance } from '@/features/maintenance/hooks/useMaintenance';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { useUnits } from '@/features/units/hooks/useUnits';
import { downloadCsv } from '@/lib/api/export';

const INITIAL_FORM = {
  propertyId: '',
  unitId: '',
  issue: '',
  priority: 'Low' as MaintenanceRequest['priority'],
  description: '',
};

export const Maintenance = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editForm, setEditForm] = useState({
    issue: '',
    priority: 'Low' as MaintenanceRequest['priority'],
    status: 'Open' as MaintenanceRequest['status'],
    vendor: '',
    description: '',
  });
  const { data: maintenance, create, update, remove } = useMaintenance();
  const { data: properties } = useProperties();
  const { data: units } = useUnits();

  const filteredTickets = maintenance.filter(m => {
    const property = properties.find(p => p.id === m.propertyId);
    return m.issue.toLowerCase().includes(searchQuery.toLowerCase()) || 
           property?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = [
    { label: 'Active', value: String(maintenance.filter((item) => item.status === 'In Progress').length), icon: Clock, color: 'text-amber-500', borderColor: 'border-l-amber-500', desc: 'Requests in progress' },
    { label: 'Pending', value: String(maintenance.filter((item) => item.status === 'Open').length), icon: AlertCircle, color: 'text-primary', borderColor: 'border-l-primary', desc: 'Awaiting assignment' },
    { label: 'Resolved', value: String(maintenance.filter((item) => item.status === 'Resolved').length), icon: CheckCircle2, color: 'text-emerald-500', borderColor: 'border-l-emerald-500', desc: 'Completed this cycle' },
  ];

  const filteredUnits = units.filter((unit) => !form.propertyId || unit.propertyId === form.propertyId);

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.unitId || !form.issue) return;

    await create({
      propertyId: form.propertyId,
      unitId: form.unitId,
      issue: form.issue,
      priority: form.priority,
      status: 'Open',
      description: form.description || 'No details provided.',
    });
    setForm(INITIAL_FORM);
    setIsModalOpen(false);
  };

  const openEditModal = () => {
    if (!selectedTicket) return;
    setEditForm({
      issue: selectedTicket.issue,
      priority: selectedTicket.priority,
      status: selectedTicket.status,
      vendor: selectedTicket.vendor || '',
      description: selectedTicket.description,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.14em]">Maintenance</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.24em] mt-2 sm:mt-4">Concierge Service Registry</p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH SERVICE LOGS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-12 pr-4 py-2.5 sm:py-4 text-[9px] sm:text-[10px] uppercase tracking-widest"
          />
        </div>
        <button 
          onClick={() => void downloadCsv("maintenance")}
          className="flex items-center justify-center gap-3 px-6 sm:px-8 py-2.5 sm:py-4 border border-border text-foreground rounded-md font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-6 sm:px-8 py-2.5 sm:py-4 bg-primary text-primary-foreground rounded-md font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Request Service</span>
          <span className="sm:hidden">New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12 items-start">
        {/* Main Content - Tickets List */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Active Service Logs</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-primary" />
              <span className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest">Filter By Priority</span>
            </div>
          </div>
          
          <div className="premium-surface overflow-hidden">
            <div className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filteredTickets.map((ticket) => {
                  const property = properties.find(p => p.id === ticket.propertyId);
                  const unit = units.find(u => u.id === ticket.unitId);
                  
                  return (
                    <motion.div 
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 sm:p-6 md:p-8 hover:bg-background/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 group cursor-pointer"
                    >
                      <div className="flex items-start gap-4 sm:gap-6">
                        <div className={cn(
                          "p-2.5 sm:p-4 rounded border shrink-0 transition-colors",
                          ticket.priority === 'High' ? "border-red-500/30 text-red-500 bg-red-500/5" : 
                          ticket.priority === 'Medium' ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : "border-primary/30 text-primary bg-primary/5"
                        )}>
                          <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wider group-hover:text-primary transition-colors truncate">{ticket.issue}</h4>
                          <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest mt-1 truncate">{property?.name} • UNIT {unit?.number}</p>
                          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                            <span className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> {ticket.date}
                            </span>
                            <span className={cn(
                              "text-[7px] sm:text-[8px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded border",
                              ticket.priority === 'High' ? "border-red-500/30 text-red-500" : 
                              ticket.priority === 'Medium' ? "border-amber-500/30 text-amber-500" : "border-primary/30 text-primary"
                            )}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 pl-12 sm:pl-0">
                        <div className="text-left sm:text-right hidden md:block">
                          <p className="text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-widest mb-0.5 sm:mb-1">Assigned Vendor</p>
                          <p className="text-[8px] sm:text-[9px] font-bold text-foreground uppercase tracking-widest">{ticket.vendor || 'Awaiting Assignment'}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
                          <StatusBadge status={ticket.status} />
                          <button className="p-1.5 sm:p-2 text-muted-foreground group-hover:text-primary transition-all">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar - Stats & Actions */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center justify-between mb-2 xl:hidden">
            <h2 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Service Metrics</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className={cn(
                "bg-card p-6 sm:p-8 rounded-lg card-shadow border border-border border-l-4 group hover:border-primary/30 transition-all", 
                stat.borderColor
              )}>
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <stat.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", stat.color)} />
                  <h3 className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest">{stat.label}</h3>
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-tighter mt-1 sm:mt-2">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Info Card */}
          <div className="bg-card p-6 sm:p-8 rounded-lg card-shadow border border-border border-t-4 border-t-primary hidden xl:block">
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Maintenance Policy</h3>
            <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-wider">
              All high-priority requests are dispatched within 2 hours. Standard requests are reviewed within 24 business hours.
            </p>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Avg Response Time</span>
                <span className="text-primary">1.4 Hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      <Modal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        title="Service Request Details"
      >
        {selectedTicket && (
          <div className="space-y-6 sm:space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 bg-card rounded border border-border gap-6">
              <div className="space-y-2">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Issue Description</h3>
                <p className="text-lg sm:text-xl font-bold text-foreground uppercase tracking-wider">{selectedTicket.issue}</p>
              </div>
              <div className="text-left sm:text-right space-y-2">
                <StatusBadge status={selectedTicket.status} />
                <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">TICKET ID: #{selectedTicket.id.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary" /> Reported Date
                  </h4>
                  <p className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider">{selectedTicket.date}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-primary" /> Priority Level
                  </h4>
                  <p className={cn(
                    "text-[11px] sm:text-xs font-bold uppercase tracking-wider",
                    selectedTicket.priority === 'High' ? "text-red-500" : "text-primary"
                  )}>{selectedTicket.priority}</p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" /> Assigned Vendor
                  </h4>
                  <p className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider">{selectedTicket.vendor || 'Pending Selection'}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Wrench className="w-3 h-3 text-primary" /> Service Type
                  </h4>
                  <p className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider">GENERAL MAINTENANCE</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detailed Notes</h4>
              <div className="p-4 sm:p-6 bg-card border border-border rounded">
                <p className="text-[10px] sm:text-[11px] text-foreground leading-relaxed tracking-wide">{selectedTicket.description}</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Service Timeline</h4>
              <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                  <p className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest">Ticket Created</p>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">{selectedTicket.date} • SYSTEM</p>
                </div>
                {selectedTicket.vendor && (
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                    <p className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest">Vendor Assigned</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">{selectedTicket.date} • ADMIN</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 sm:gap-6 pt-6 border-t border-border">
              <button
                className="w-full sm:w-auto px-8 py-3 border border-border text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded"
                onClick={openEditModal}
              >
                Edit Request
              </button>
              <button
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3 bg-primary text-primary-foreground rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <MessageSquare className="w-4 h-4" />
                Remove Request
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service Request"
      >
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedTicket) return;
            const updated = await update(selectedTicket.id, {
              issue: editForm.issue,
              priority: editForm.priority,
              status: editForm.status,
              vendor: editForm.vendor,
              description: editForm.description,
            });
            if (updated) setSelectedTicket(updated);
            setIsEditModalOpen(false);
          }}
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Issue</label>
            <input
              type="text"
              value={editForm.issue}
              onChange={(e) => setEditForm((prev) => ({ ...prev, issue: e.target.value }))}
              className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={editForm.priority}
                onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value as MaintenanceRequest['priority'] }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as MaintenanceRequest['status'] }))}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vendor</label>
              <input
                type="text"
                value={editForm.vendor}
                onChange={(e) => setEditForm((prev) => ({ ...prev, vendor: e.target.value }))}
                className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-card border border-border rounded px-4 py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all resize-none"
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
              Save Request
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Service Request"
      >
        <div className="space-y-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            This will remove request <span className="text-foreground font-bold">{selectedTicket?.issue}</span>.
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
                if (!selectedTicket) return;
                await remove(selectedTicket.id);
                setIsDeleteModalOpen(false);
                setSelectedTicket(null);
              }}
            >
              Delete Request
            </button>
          </div>
        </div>
      </Modal>

      {/* New Request Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setForm(INITIAL_FORM);
        }} 
        title="New Service Request"
      >
        <form className="space-y-6 sm:space-y-8" onSubmit={handleCreateRequest}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.propertyId}
                onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value, unitId: '' }))}
              >
                <option value="">SELECT ASSET...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit</label>
              <select
                className="w-full bg-card border border-border rounded px-4 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                value={form.unitId}
                onChange={(e) => setForm((prev) => ({ ...prev, unitId: e.target.value }))}
              >
                <option value="">SELECT UNIT...</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>{unit.number}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Issue Brief</label>
            <input 
              type="text" 
              placeholder="e.g. HVAC System Intermittent Failure"
              value={form.issue}
              onChange={(e) => setForm((prev) => ({ ...prev, issue: e.target.value }))}
              className="w-full bg-card border border-border rounded px-4 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority Level</label>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {['Low', 'Medium', 'High'].map((priority) => (
                <label key={priority} className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 border border-border rounded cursor-pointer hover:border-primary transition-all group">
                  <input
                    type="radio"
                    name="priority"
                    className="hidden"
                    checked={form.priority === priority}
                    onChange={() => setForm((prev) => ({ ...prev, priority: priority as MaintenanceRequest['priority'] }))}
                  />
                  <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detailed Description</label>
            <textarea 
              rows={4}
              placeholder="Provide comprehensive details regarding the service requirement..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full bg-card border border-border rounded px-4 py-3 sm:py-4 text-[10px] sm:text-xs uppercase tracking-widest focus:outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 sm:gap-6 pt-6 border-t border-border">
            <button 
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setForm(INITIAL_FORM);
              }}
              className="w-full sm:w-auto px-8 py-3 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto px-10 py-3 bg-primary text-primary-foreground rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all"
            >
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Maintenance;
