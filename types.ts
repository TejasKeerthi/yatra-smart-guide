
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

export interface ItinerarySegment {
  timeOfDay: string; // Morning, Afternoon, Evening
  title: string;
  description: string;
  location?: string;
  tips?: string;
  travelEstimate?: string; // e.g., "15 min drive"
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DayPlan {
  day: number;
  segments: ItinerarySegment[];
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