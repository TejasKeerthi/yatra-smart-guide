import { GeneratedItinerary } from '../types';

// MOCK SHARE SERVICE
// Uses LocalStorage instead of Firestore. 
// Note: Shared links will only work on the same device/browser in this mode.

export const saveItineraryToCloud = async (itinerary: GeneratedItinerary, location: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const id = Math.random().toString(36).substr(2, 9);
  const data = {
    itinerary,
    location,
    createdAt: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(`trip_${id}`, JSON.stringify(data));
    return id;
  } catch (error) {
    console.error("Storage error", error);
    throw new Error("Failed to save trip locally.");
  }
}

export const getItineraryFromCloud = async (id: string): Promise<{itinerary: GeneratedItinerary, location: string} | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const item = localStorage.getItem(`trip_${id}`);
    if (item) {
      return JSON.parse(item);
    }
    return null;
  } catch (error) {
    console.error("Storage error", error);
    return null;
  }
}