import React, { useEffect, useRef, useState } from 'react';
import { GeneratedItinerary, DayPlan, ItinerarySegment } from '../types';
import { Map as MapIcon, Sun, Sunset, Moon, Navigation, Coffee, Share2, Loader2, Car, Footprints, FileDown } from 'lucide-react';
import { saveItineraryToCloud } from '../services/shareService';
import { downloadItineraryPDF } from '../services/pdfService';
import { ShareModal } from './ShareModal';

interface ItineraryViewProps {
  itinerary: GeneratedItinerary;
  locationName: string;
  onReset: () => void;
  darkMode: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary, locationName, onReset, darkMode }) => {
  const [activeDay, setActiveDay] = useState(1);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleShare = async () => {
    if (shareUrl) {
      setIsShareModalOpen(true);
      return;
    }

    setIsShareLoading(true);
    try {
      const id = await saveItineraryToCloud(itinerary, locationName);
      const url = `${window.location.origin}?trip=${id}`;
      setShareUrl(url);
      setIsShareModalOpen(true);
    } catch (error) {
      alert("Failed to create share link. Please try again.");
    } finally {
      setIsShareLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    downloadItineraryPDF(itinerary, locationName);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={shareUrl || ''} 
      />

      {/* Header */}
      <div className="relative text-center mb-8 md:mb-12">
        <div className="absolute top-0 right-0 hidden md:flex items-center gap-2">
           <button
             onClick={handleDownloadPDF}
             className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all"
           >
             <FileDown size={16} />
             PDF
           </button>
           
           <button
             onClick={handleShare}
             disabled={isShareLoading}
             className="flex items-center gap-2 px-4 py-2 bg-brand-600 border border-brand-600 shadow-sm rounded-full text-sm font-semibold text-white hover:bg-brand-700 hover:shadow-md transition-all disabled:opacity-70"
           >
             {isShareLoading ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
             Share
           </button>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 text-sm font-medium mb-4">
          <MapIcon size={16} />
          <span>Trip to {locationName}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{itinerary.title}</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">{itinerary.overview}</p>

        {/* Mobile Buttons */}
        <div className="md:hidden mt-6 flex justify-center gap-3">
           <button
             onClick={handleDownloadPDF}
             className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
           >
             <FileDown size={16} />
             PDF
           </button>
           <button
             onClick={handleShare}
             disabled={isShareLoading}
             className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 border border-brand-600 shadow-sm rounded-full text-sm font-semibold text-white hover:bg-brand-700 transition-all"
           >
             {isShareLoading ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
             Share
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* Left Column: Itinerary Timeline */}
        <div className="space-y-12 order-2 lg:order-1">
          {itinerary.days.map((day) => (
            <div 
              key={day.day} 
              id={`day-${day.day}`}
              onMouseEnter={() => setActiveDay(day.day)}
              className="scroll-mt-24"
            >
              <DaySection day={day} />
            </div>
          ))}
          
          <div className="mt-16 text-center">
            <button
              onClick={onReset}
              className="px-8 py-3 bg-slate-900 dark:bg-brand-600 text-white rounded-full font-semibold shadow-lg hover:bg-slate-800 dark:hover:bg-brand-700 transition-colors"
            >
              Plan Another Trip
            </button>
          </div>
        </div>

        {/* Right Column: Map (Sticky) */}
        <div className="order-1 lg:order-2 lg:h-[calc(100vh-120px)] lg:sticky lg:top-24">
          <div className="h-[400px] lg:h-full w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <MapComponent itinerary={itinerary} activeDay={activeDay} darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MapComponent: React.FC<{ itinerary: GeneratedItinerary; activeDay: number; darkMode: boolean }> = ({ itinerary, activeDay, darkMode }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<any[]>([]);
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Initialize Map
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
    }

    // Switch Tile Layer based on Dark Mode
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = darkMode 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
    const attribution = darkMode
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    tileLayerRef.current = window.L.tileLayer(tileUrl, { attribution }).addTo(mapRef.current);

    // Clear existing markers/layers
    layersRef.current.forEach(layer => mapRef.current.removeLayer(layer));
    layersRef.current = [];

    // Collect all coordinates for bounds
    const allCoords: [number, number][] = [];
    const dayCoords: [number, number][] = [];

    itinerary.days.forEach(day => {
      day.segments.forEach(segment => {
        if (segment.coordinates) {
          const point: [number, number] = [segment.coordinates.lat, segment.coordinates.lng];
          allCoords.push(point);
          if (day.day === activeDay) {
            dayCoords.push(point);
          }
        }
      });
    });

    // Draw Markers and Route
    const L = window.L;
    
    // Create icons
    const createIcon = (color: string, number?: number) => L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid ${darkMode ? '#1e293b' : 'white'}; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-family: sans-serif;">${number || ''}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const routeColor = darkMode ? '#2dd4bf' : '#0d9488';

    // Draw current day route
    if (dayCoords.length > 0) {
      const polyline = L.polyline(dayCoords, { color: routeColor, weight: 4, opacity: 0.8, dashArray: '10, 10' }).addTo(mapRef.current);
      layersRef.current.push(polyline);
    }

    // Add markers
    let segmentCount = 1;
    itinerary.days.forEach(day => {
      const isCurrentDay = day.day === activeDay;
      day.segments.forEach(segment => {
        if (segment.coordinates) {
          const marker = L.marker([segment.coordinates.lat, segment.coordinates.lng], {
            icon: createIcon(isCurrentDay ? routeColor : (darkMode ? '#475569' : '#94a3b8'), isCurrentDay ? segmentCount : undefined),
            opacity: isCurrentDay ? 1 : 0.6
          }).bindPopup(`<b>${segment.title}</b><br>${segment.timeOfDay}`);
          
          marker.addTo(mapRef.current);
          layersRef.current.push(marker);
          
          if (isCurrentDay) segmentCount++;
        }
      });
      if (isCurrentDay) segmentCount = 1;
    });

    // Fit bounds
    if (dayCoords.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(dayCoords), { padding: [50, 50] });
    } else if (allCoords.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
    }

  }, [itinerary, activeDay, darkMode]);

  return <div ref={mapContainerRef} className="w-full h-full bg-slate-100 dark:bg-slate-900" />;
};

const DaySection: React.FC<{ day: DayPlan }> = ({ day }) => {
  return (
    <div className="relative">
      <div className="sticky top-24 lg:top-4 z-30 mb-8">
        <span className="inline-block px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xl font-bold rounded-r-full shadow-lg">
          Day {day.day}
        </span>
      </div>

      <div className="border-l-2 border-slate-200 dark:border-slate-800 ml-6 md:ml-10 space-y-12 pl-8 md:pl-12 pb-4 pt-2">
        {day.segments.map((segment, idx) => (
          <TimelineItem key={idx} segment={segment} index={idx} />
        ))}
      </div>
    </div>
  );
};

const TimelineItem: React.FC<{ segment: ItinerarySegment; index: number }> = ({ segment, index }) => {
  const getIcon = (time: string) => {
    const t = time.toLowerCase();
    if (t.includes('morning')) return <Sun className="text-amber-500" size={20} />;
    if (t.includes('afternoon') || t.includes('lunch')) return <Sun className="text-orange-500" size={20} />;
    if (t.includes('evening') || t.includes('dinner')) return <Sunset className="text-indigo-500" size={20} />;
    return <Moon className="text-slate-400" size={20} />;
  };

  return (
    <div className="relative group">
      {/* Travel Estimate */}
      {segment.travelEstimate && index > 0 && (
        <div className="absolute -top-10 -left-[20px] md:-left-[20px] flex items-center gap-2 z-0">
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            {segment.travelEstimate.toLowerCase().includes('walk') ? <Footprints size={12} /> : <Car size={12} />}
            {segment.travelEstimate}
          </div>
        </div>
      )}

      {/* Connector Dot */}
      <div className="absolute -left-[41px] md:-left-[59px] top-6 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-brand-200 dark:border-brand-900 group-hover:border-brand-500 dark:group-hover:border-brand-500 transition-colors z-20 flex items-center justify-center shadow-sm">
        <div className="w-2 h-2 bg-brand-500 rounded-full" />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
              {getIcon(segment.timeOfDay)}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                {segment.timeOfDay}
              </span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{segment.title}</h4>
            </div>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {segment.description}
        </p>

        {(segment.tips || segment.location) && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
            {segment.location && (
              <div className="flex items-start gap-2 text-sm text-brand-700 dark:text-brand-400">
                <Navigation size={16} className="mt-0.5 shrink-0" />
                <span className="font-medium">{segment.location}</span>
              </div>
            )}
            {segment.tips && (
              <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-lg">
                <Coffee size={16} className="mt-0.5 shrink-0" />
                <span className="italic">"{segment.tips}"</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};