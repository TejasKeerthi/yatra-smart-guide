import { GeneratedItinerary } from '../types';

// Mock storage using localStorage since Firebase is disabled in this environment
const STORAGE_KEY = 'yatra_itineraries_db';

interface StoredItineraryRecord {
  id: string;
  data: GeneratedItinerary;
  location: string;
  createdAt: string;
}

export const saveItineraryToCloud = async (itinerary: GeneratedItinerary, location: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const id = Math.random().toString(36).substring(2, 10);
  const record: StoredItineraryRecord = {
    id,
    data: itinerary,
    location,
    createdAt: new Date().toISOString()
  };

  try {
    const existingStr = localStorage.getItem(STORAGE_KEY);
    const items: StoredItineraryRecord[] = existingStr ? JSON.parse(existingStr) : [];
    items.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return id;
  } catch (e) {
    console.error("Mock save failed", e);
    throw new Error("Failed to save trip locally.");
  }
}

export const getItineraryFromCloud = async (id: string): Promise<{itinerary: GeneratedItinerary, location: string} | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  try {
    const existingStr = localStorage.getItem(STORAGE_KEY);
    if (!existingStr) return null;

    const items: StoredItineraryRecord[] = JSON.parse(existingStr);
    const found = items.find(i => i.id === id);

    if (found) {
      return {
        itinerary: found.data,
        location: found.location
      };
    }
    return null;
  } catch (e) {
    console.error("Mock fetch failed", e);
    return null;
  }
}
