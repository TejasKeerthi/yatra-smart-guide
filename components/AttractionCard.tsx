import React from 'react';
import { Attraction } from '../types';
import { Check, Clock, Star, Info } from 'lucide-react';

interface AttractionCardProps {
  attraction: Attraction;
  isSelected: boolean;
  onToggle: (attraction: Attraction) => void;
  onViewDetails: (attraction: Attraction) => void;
  index: number;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ 
  attraction, 
  isSelected, 
  onToggle, 
  onViewDetails, 
  index 
}) => {
  // Generate a deterministic placeholder based on index
  const imageUrl = `https://picsum.photos/400/300?random=${index + 100}`;

  return (
    <div 
      className={`
        group relative overflow-hidden rounded-2xl transition-all duration-300 border flex flex-col h-full
        ${isSelected 
          ? 'border-brand-500 ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 shadow-xl bg-white dark:bg-slate-800' 
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg hover:-translate-y-1'
        }
      `}
    >
      {/* Clickable Image Area for Details */}
      <div 
        onClick={() => onViewDetails(attraction)}
        className="h-48 w-full overflow-hidden relative cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 transition-opacity group-hover:opacity-90" />
        <img 
          src={imageUrl} 
          alt={attraction.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs px-2 py-1 rounded-full">
           <Star size={12} className="text-yellow-400 fill-yellow-400" />
           <span className="font-semibold">{attraction.rating}</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-20">
           <h3 className="text-white font-bold text-lg leading-tight shadow-sm mb-1">{attraction.name}</h3>
           <div className="flex items-center gap-2 text-white/90 text-xs">
              <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">{attraction.category}</span>
           </div>
        </div>
      </div>

      {/* Selection Toggle (Top Right) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(attraction);
        }}
        className={`
          absolute top-3 right-3 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
          ${isSelected 
            ? 'bg-brand-500 text-white scale-110' 
            : 'bg-white dark:bg-slate-700 text-slate-300 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-400'}
        `}
        title={isSelected ? "Remove from plan" : "Add to plan"}
      >
        <Check size={20} strokeWidth={3} />
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow cursor-default">
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 leading-relaxed mb-4 flex-grow">
          {attraction.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700 mt-auto">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs gap-1">
            <Clock size={14} />
            <span>{attraction.estimatedTime}</span>
          </div>
          
          <button 
            onClick={() => onViewDetails(attraction)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center gap-1 transition-colors"
          >
            Details <Info size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};