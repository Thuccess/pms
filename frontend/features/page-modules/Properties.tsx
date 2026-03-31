import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal';
import { PropertyCard } from '@/components/PropertyCard';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEntityFilters } from '@/hooks/useEntityFilters';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { downloadCsv } from '@/lib/api/export';
import { uploadImageFile } from '@/lib/api/upload';

const INITIAL_FORM = {
  name: '',
  location: '',
  type: 'PENTHOUSE',
  price: '',
  description: '',
  image: '',
  images: [] as string[],
};

export const Properties = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const { data: properties, create } = useProperties();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    activeFilter: filterType,
    setActiveFilter: setFilterType,
    filteredItems: filteredProperties,
  } = useEntityFilters(
    properties,
    (property, query, activeFilter) =>
      (activeFilter === 'All' || property.type.toLowerCase().includes(activeFilter.toLowerCase())) &&
      (property.name.toLowerCase().includes(query.toLowerCase()) ||
        property.location.toLowerCase().includes(query.toLowerCase()))
  );

  const handleCreateProperty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.location) return;
    if (uploading) return;

    const images = form.images.length > 0
      ? form.images
      : form.image
        ? [form.image]
        : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'];
    await create({
      name: form.name,
      location: form.location,
      type: form.type,
      price: Number(form.price || 0),
      image: images[0],
      images,
      status: 'Active',
      description: form.description || 'No description provided.',
      amenities: ['Concierge'],
      units: 0,
      occupancy: 0,
      revenue: 0,
    });
    setForm(INITIAL_FORM);
    setPreviews([]);
    setUploadProgress(0);
    setIsModalOpen(false);
  };

  const handleFiles = async (files?: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setError("");
    const fileList = Array.from(files);
    const invalid = fileList.find((file) => !file.type.startsWith('image/'));
    if (invalid) {
      setError(`Unsupported image format: ${invalid.name}`);
      return;
    }
    setUploading(true);
    setUploadProgress(1);
    const nextPreviews = fileList.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...nextPreviews]);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < fileList.length; i += 1) {
        const uploaded = await uploadImageFile(fileList[i], (progress) => {
          const compositeProgress = Math.round(((i + progress / 100) / fileList.length) * 100);
          setUploadProgress(compositeProgress);
        });
        uploadedUrls.push(uploaded.url);
      }
      setForm((prev) => {
        const merged = [...prev.images, ...uploadedUrls];
        return { ...prev, images: merged, image: merged[0] || prev.image };
      });
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
      setPreviews((prev) => prev.slice(0, Math.max(0, prev.length - fileList.length)));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">Asset Registry</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-3">Manage elite property portfolio</p>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 sm:gap-6">
        <div className="relative flex-1 md:w-72 xl:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="SEARCH ASSETS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="premium-input pl-12 pr-4 py-3.5 text-[10px] uppercase tracking-[0.18em]"
          />
        </div>
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-md overflow-x-auto custom-scrollbar">
          {['All', 'Penthouse', 'Apartment', 'Villa'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-4 lg:px-6 py-2.5 text-[8px] lg:text-[9px] font-bold uppercase tracking-widest rounded transition-all whitespace-nowrap",
                filterType === type ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <button 
          onClick={() => void downloadCsv("properties")}
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
          <span className="hidden sm:inline">Add Asset</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProperties.map((property) => (
            <motion.div
              key={property.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => router.push(`/properties/${property.id}`)}
              className="cursor-pointer"
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Property Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add Elite Asset"
      >
        <form className="space-y-6 sm:space-y-8" onSubmit={handleCreateProperty}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Name</label>
              <input 
                type="text" 
                placeholder="e.g. The Golden Heights"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</label>
              <input 
                type="text" 
                placeholder="e.g. Dubai Marina, UAE"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Type</label>
              <select
                className="premium-input text-xs uppercase tracking-widest"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option>PENTHOUSE</option>
                <option>VILLA</option>
                <option>APARTMENT</option>
                <option>COMMERCIAL</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Valuation (USD)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className="premium-input text-xs uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Description</label>
            <textarea 
              rows={4}
              placeholder="Describe the elite features of this asset..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="premium-input text-xs uppercase tracking-widest resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Images</label>
            <label
              className="block border border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void handleFiles(e.dataTransfer.files);
              }}
            >
              <Upload className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Drag & drop or click to upload multiple images
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handleFiles(e.target.files || undefined);
                }}
              />
            </label>
            {previews.length > 0 || form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...new Set([...form.images, ...previews])].map((src) => (
                  <img key={src} src={src} alt="Preview" className="w-full h-24 rounded-md object-cover border border-border" />
                ))}
              </div>
            ) : null}
            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="w-full h-2 bg-secondary rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            ) : null}
            {error ? <p className="text-[9px] font-bold uppercase tracking-widest text-red-500">{error}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-6 pt-6 border-t border-border">
            <button 
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setForm(INITIAL_FORM);
                setPreviews([]);
                setUploadProgress(0);
                setError("");
              }}
              className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
            >
              {uploading ? "Uploading..." : "Register Asset"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Properties;
