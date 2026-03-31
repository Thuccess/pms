import React from 'react';
import { Heart, MapPin, Layers, Users, TrendingUp } from 'lucide-react';
import { Property } from '../types';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const primaryImage = property.images?.[0] || property.image;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-card rounded-xl overflow-hidden card-shadow group border border-border hover:border-primary/40 transition-all duration-500"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={primaryImage}
          alt={property.name}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
        <button className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-primary transition-all border border-white/10 touch-target">
          <Heart className="w-4 h-4" />
        </button>
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-md uppercase tracking-[0.16em]">
            {property.status}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-wider line-clamp-2 min-w-0">
            {property.name}
          </h3>
          <p className="text-base sm:text-lg font-bold text-primary shrink-0">
            ${property.price.toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 text-muted-foreground mb-6">
          <MapPin className="w-3 h-3 text-primary" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest truncate">{property.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-border mb-6">
          <div className="flex flex-col items-center gap-1">
            <Layers className="w-4 h-4 text-primary/70" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{property.units} Units</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-border">
            <Users className="w-4 h-4 text-primary/70" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{property.occupancy}% Occ.</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <TrendingUp className="w-4 h-4 text-primary/70" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">${(property.revenue / 1000).toFixed(0)}k Rev.</span>
          </div>
        </div>

        <button className="w-full py-3 sm:py-3.5 min-h-11 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-[0.24em] hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-md">
          View Details
        </button>
      </div>
    </motion.div>
  );
};
