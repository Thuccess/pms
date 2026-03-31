import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Users, 
  TrendingUp, 
  Layers, 
  CreditCard, 
  Wrench,
  Plus,
  ChevronRight,
  ExternalLink,
  Shield,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table, TableRow, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { usePropertyDetails } from '@/hooks/usePropertyDetails';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { uploadImageFile } from '@/lib/api/upload';

export const PropertyDetails = () => {
  const params = useParams<{ id: string | string[] }>();
  const id = params?.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    type: '',
    price: '',
    status: 'Active' as 'Active' | 'Under Maintenance' | 'Sold',
    units: '',
    occupancy: '',
    revenue: '',
    description: '',
    amenities: '',
    images: [] as string[],
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editError, setEditError] = useState('');
  const { update, remove } = useProperties();

  const propertyId = Array.isArray(id) ? id[0] : id;
  const { loading, property, propertyUnits, propertyTenants, propertyPayments, propertyMaintenance } =
    usePropertyDetails(propertyId);
  if (loading) return <div className="text-muted-foreground">Loading property...</div>;
  if (!property) return <div>Property not found</div>;
  const galleryImages = property.images?.length ? property.images : property.image ? [property.image] : [];

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'units', label: 'Units', icon: Layers },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'maintenance', label: 'Concierge', icon: Wrench },
  ];

  const openEditModal = () => {
    setEditForm({
      name: property.name,
      location: property.location,
      type: property.type,
      price: String(property.price),
      status: property.status,
      units: String(property.units),
      occupancy: String(property.occupancy),
      revenue: String(property.revenue),
      description: property.description,
      amenities: property.amenities.join(', '),
      images: property.images?.length ? [...property.images] : property.image ? [property.image] : [],
    });
    setEditError('');
    setUploadProgress(0);
    setIsEditModalOpen(true);
  };

  const handleEditImagesUpload = async (files?: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    const invalid = fileList.find((file) => !file.type.startsWith('image/'));
    if (invalid) {
      setEditError(`Unsupported image format: ${invalid.name}`);
      return;
    }

    setEditError('');
    setUploadingImages(true);
    setUploadProgress(1);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < fileList.length; i += 1) {
        const uploaded = await uploadImageFile(fileList[i], (progress) => {
          const compositeProgress = Math.round(((i + progress / 100) / fileList.length) * 100);
          setUploadProgress(compositeProgress);
        });
        uploadedUrls.push(uploaded.url);
      }
      setEditForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setUploadProgress(100);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to upload images');
      setUploadProgress(0);
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
        <div className="space-y-4 sm:space-y-6">
          <button 
            onClick={() => router.push('/properties')}
            className="flex items-center gap-3 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] hover:text-primary transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.12em]">{property.name}</h1>
              <StatusBadge status={property.status} className="h-fit w-fit" />
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{property.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{property.type}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-4 border border-border text-[8px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded-md"
            onClick={openEditModal}
          >
            Edit Asset
          </button>
          <button
            className="flex-1 sm:flex-none px-6 sm:px-10 py-2.5 sm:py-4 bg-primary text-primary-foreground rounded-md font-bold text-[8px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Asset
          </button>
        </div>
      </div>

      {/* Hero & Quick Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 sm:gap-12">
        {/* Hero Gallery */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
          <div className="relative aspect-video lg:aspect-21/9 xl:aspect-video rounded-lg overflow-hidden border border-border group">
            <img 
              src={galleryImages[0] || property.image} 
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-40" />
            <button className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 px-4 sm:px-6 py-2 sm:py-3 bg-card/60 backdrop-blur-md border border-white/20 text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-widest rounded hover:bg-card transition-all">
              View All {galleryImages.length} Media
            </button>
          </div>
          
          {galleryImages.length > 1 ? (
            <div className="hidden lg:grid grid-cols-2 gap-6 sm:gap-8">
              {galleryImages.slice(1, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="aspect-video rounded-lg overflow-hidden border border-border group">
                  <img
                    src={image}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    alt={`${property.name} ${index + 2}`}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Quick Stats - Side Panel on XL, Grid on LG/MD/SM */}
        <div className="xl:col-span-4 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
            <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Current Valuation</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">${(property.price / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
            <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Units</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{property.units}</p>
                </div>
              </div>
            </div>
            <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Occupancy Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-500">{property.occupancy}%</p>
                </div>
              </div>
            </div>
            <div className="premium-surface p-6 sm:p-8 group hover:border-primary/40 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-secondary rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Security Status</p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-500 uppercase tracking-widest">VERIFIED</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 sm:p-8 rounded-lg border border-border card-shadow space-y-6">
            <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="w-full py-3.5 bg-primary text-primary-foreground rounded font-bold text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all">
                Generate Full Report
              </button>
              <button className="w-full py-3.5 bg-secondary border border-border text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded">
                Contact Asset Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 sm:gap-10 border-b border-border pb-4 sm:pb-6 overflow-x-auto custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 sm:gap-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all pb-4 sm:pb-6 -mb-4 sm:-mb-6 relative whitespace-nowrap",
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] sm:min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 sm:gap-12">
            <div className="xl:col-span-2 space-y-8 sm:space-y-12">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[9px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Asset Description</h3>
                <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed tracking-wide max-w-4xl">
                  {property.description}
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Elite Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 sm:p-6 bg-card border border-border rounded group hover:border-primary/30 transition-all">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-foreground uppercase tracking-widest">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-card p-6 sm:p-8 rounded-lg border border-border card-shadow space-y-6 sm:space-y-8">
                <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Financial Performance</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">Monthly Yield</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-500">+$45,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">Annual ROI</span>
                    <span className="text-base sm:text-lg font-bold text-foreground">8.4%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">Expense Ratio</span>
                    <span className="text-base sm:text-lg font-bold text-rose-500">12.5%</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-border">
                  <button className="w-full py-3.5 bg-secondary border border-border text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded">
                    Download Financial Audit
                  </button>
                </div>
              </div>

              <div className="bg-card p-6 sm:p-8 rounded-lg border border-border card-shadow space-y-6">
                <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Recent Activity</h3>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-1 h-10 bg-primary/30 rounded" />
                      <div>
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">Lease Renewed</p>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Unit 402 • 2 days ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'units' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Unit Registry ({propertyUnits.length})</h3>
              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all">
                <Plus className="w-4 h-4" />
                Add Unit
              </button>
            </div>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table headers={['Unit ID', 'Type', 'Monthly Rent', 'Status', 'Tenant', 'Actions']}>
                {propertyUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-bold text-primary">{unit.number}</TableCell>
                    <TableCell>{unit.type}</TableCell>
                    <TableCell>${unit.rent.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={unit.status} /></TableCell>
                    <TableCell>
                      {unit.tenantId ? (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-secondary flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-primary">
                            {propertyTenants.find(t => t.id === unit.tenantId)?.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="hidden sm:inline">{propertyTenants.find(t => t.id === unit.tenantId)?.name}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <button className="p-2 text-muted-foreground hover:text-primary transition-all"><ExternalLink className="w-4 h-4" /></button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Resident Registry ({propertyTenants.length})</h3>
              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all">
                <Plus className="w-4 h-4" />
                Invite Resident
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {propertyTenants.map((tenant) => (
                <div key={tenant.id} className="bg-card p-6 sm:p-8 rounded-lg border border-border card-shadow group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-5 sm:gap-6 mb-6 sm:mb-8">
                    <img src={tenant.avatar} className="w-14 h-14 sm:w-16 sm:h-16 rounded border border-border group-hover:border-primary transition-all object-cover" alt="" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{tenant.name}</h4>
                      <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">UNIT {propertyUnits.find(u => u.id === tenant.unitId)?.number}</p>
                    </div>
                  </div>
                  <div className="space-y-4 py-4 sm:py-6 border-y border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Lease End</span>
                      <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">{tenant.leaseEnd}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Balance</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", tenant.balance > 0 ? "text-red-500" : "text-emerald-500")}>
                        ${tenant.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-6 sm:mt-8 py-3 bg-secondary border border-border text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Transaction Registry</h3>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Total Collected</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-500">$52,000</p>
                </div>
                <button className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all">
                  <Plus className="w-4 h-4" />
                  Record Payment
                </button>
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <Table headers={['ID', 'Resident', 'Amount', 'Date', 'Method', 'Status']}>
                {propertyPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-muted-foreground text-[8px] sm:text-[10px]">{payment.id.substring(0, 8)}...</TableCell>
                    <TableCell>{propertyTenants.find(t => t.id === payment.tenantId)?.name}</TableCell>
                    <TableCell className="font-bold text-foreground">${payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell className="hidden sm:table-cell">{payment.method}</TableCell>
                    <TableCell><StatusBadge status={payment.status} /></TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-[0.3em]">Concierge Service Logs</h3>
              <button className="flex items-center justify-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all">
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>
            <div className="space-y-4 sm:space-y-6">
              {propertyMaintenance.map((request) => (
                <div key={request.id} className="bg-card p-6 sm:p-8 rounded-lg border border-border card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4 sm:gap-8">
                    <div className={cn(
                      "p-3 sm:p-4 rounded border shrink-0",
                      request.priority === 'High' ? "border-red-500/30 text-red-500" : "border-primary/30 text-primary"
                    )}>
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h4 className="text-[11px] sm:text-sm font-bold text-foreground uppercase tracking-wider group-hover:text-primary transition-colors">{request.issue}</h4>
                      <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mt-2">UNIT {propertyUnits.find(u => u.id === request.unitId)?.number} • {request.date}</p>
                      <div className="flex items-center gap-3 sm:gap-4 mt-4">
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
                          request.priority === 'High' ? "border-red-500/30 text-red-500" : 
                          request.priority === 'Medium' ? "border-amber-500/30 text-amber-500" : "border-primary/30 text-primary"
                        )}>
                          {request.priority} PRIORITY
                        </span>
                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                    {request.vendor && (
                      <div className="text-left sm:text-right">
                        <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest">Assigned Vendor</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-foreground uppercase tracking-widest mt-1">{request.vendor}</p>
                      </div>
                    )}
                    <button className="px-4 sm:px-6 py-2 border border-primary/20 text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all rounded">
                      View Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Asset"
      >
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const nextImages = editForm.images.filter(Boolean);
            if (!nextImages.length) {
              setEditError('Please upload at least one image.');
              return;
            }
            await update(property.id, {
              name: editForm.name,
              location: editForm.location,
              type: editForm.type,
              price: Number(editForm.price || 0),
              image: nextImages[0],
              images: nextImages,
              status: editForm.status,
              units: Number(editForm.units || 0),
              occupancy: Number(editForm.occupancy || 0),
              revenue: Number(editForm.revenue || 0),
              description: editForm.description,
              amenities: editForm.amenities
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            });
            setIsEditModalOpen(false);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</label>
              <input
                type="text"
                value={editForm.type}
                onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price (USD)</label>
              <input
                type="number"
                value={editForm.price}
                onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: e.target.value as 'Active' | 'Under Maintenance' | 'Sold',
                  }))
                }
                className="premium-input text-xs uppercase tracking-widest"
              >
                <option value="Active">Active</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Units</label>
              <input
                type="number"
                value={editForm.units}
                onChange={(e) => setEditForm((prev) => ({ ...prev, units: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Occupancy (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={editForm.occupancy}
                onChange={(e) => setEditForm((prev) => ({ ...prev, occupancy: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Revenue</label>
              <input
                type="number"
                value={editForm.revenue}
                onChange={(e) => setEditForm((prev) => ({ ...prev, revenue: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Description</label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
              className="premium-input text-xs tracking-wide resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amenities (comma separated)</label>
            <input
              type="text"
              value={editForm.amenities}
              onChange={(e) => setEditForm((prev) => ({ ...prev, amenities: e.target.value }))}
              className="premium-input text-xs tracking-wide"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Property Images</label>
            <label
              className="block border border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleEditImagesUpload(e.dataTransfer.files);
              }}
            >
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Drag and drop or click to upload multiple images
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handleEditImagesUpload(e.target.files || undefined);
                }}
              />
            </label>
            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="w-full h-2 bg-secondary rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            ) : null}
            {editForm.images.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {editForm.images.map((image, index) => (
                  <div key={`${image}-${index}`} className="relative border border-border rounded overflow-hidden">
                    <img src={image} alt={`Asset ${index + 1}`} className="w-full h-24 object-cover" />
                    <div className="absolute top-1 left-1 text-[8px] font-bold uppercase tracking-widest bg-card/80 px-1.5 py-1 rounded">
                      {index === 0 ? 'Primary' : `#${index + 1}`}
                    </div>
                    <button
                      type="button"
                      className="absolute top-1 right-1 text-[9px] px-2 py-1 bg-black/70 text-white rounded hover:bg-black"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, current) => current !== index),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            {editError ? <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">{editError}</p> : null}
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
              disabled={uploadingImages}
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
            >
              {uploadingImages ? 'Uploading...' : 'Save Asset'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Asset"
      >
        <div className="space-y-6">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Delete <span className="text-foreground font-bold">{property.name}</span> and its linked records?
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
                await remove(property.id);
                setIsDeleteModalOpen(false);
                router.push('/properties');
              }}
            >
              Delete Asset
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertyDetails;
