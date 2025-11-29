
export interface Review {
  author: string;
  comment: string;
  rating: number;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string; // e.g., "2 hours"
  coordinates: {
    lat: number;
    lng: number;
  };
  // New fields for detailed view
  rating: number;
  openingHours: string;
  address?: string;
  reviews: Review[];
  sourceUrl?: string; // URL from Google Search grounding
}

export interface Accommodation {
  name: string;
  type: string; // Hotel, Hostel, Resort, Camp
  rating: number;
  priceRange: string; // e.g. "₹2000 - ₹4000"
  description: string;
}

export interface ItinerarySegment {
  timeOfDay: string; // Morning, Afternoon, Evening
  title: string;
  description: string; // Strictly description of the place
  location?: string;
  
  // New Granular Fields
  foodRecommendations: string; // 1
  hiddenGems: string;          // 2
  insiderTips: string;         // 3 & 6 (Best time/Crowd)
  transportation: string;      // 4 (Metro/Bus/Fares)
  travelEstimate: string;      // 5 (Distance/Time) - Kept for timeline visual
  safety: string;              // 7
  budget: string;              // 8
  addOns: string;              // 9
  
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DayPlan {
  day: number;
  segments: ItinerarySegment[];
  suggestedStays: Accommodation[]; // New field for hotels/camps
}

export interface GeneratedItinerary {
  title: string;
  overview: string;
  days: DayPlan[];
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  SELECTING = 'SELECTING',
  PLANNING = 'PLANNING',
  VIEWING_PLAN = 'VIEWING_PLAN',
}
