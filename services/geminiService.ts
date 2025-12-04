import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Attraction, GeneratedItinerary } from "../types";

// Safe API Key retrieval for various environments (Vite, Raw HTML, Node)
const getApiKey = () => {
  try {
    // Check Vite environment
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch(e) {}
  
  try {
    // Check Node/Process environment
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch(e) {}

  // Fallback (User Provided Key for Demo)
  return "AIzaSyAepE0IsMmaZqdC9ACVI4nyoGOtib-P3_M";
};

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Searches for top attractions in a given location using Gemini with Google Search Grounding.
 */
export const searchAttractionsInLocation = async (location: string): Promise<Attraction[]> => {
  const modelId = "gemini-2.5-flash"; 

  const prompt = `Fast search: Find 8 top tourist attractions in India matching the query: "${location}". 
  
  Context:
  - If the query is a city (e.g. "Delhi"), find top general attractions there.
  - If the query is a CATEGORY (e.g. "Historical sites", "Museums", "Temples"), find the best examples of that category in the specified city or across India if no city is named.
  - If the query is "Category in City" (e.g. "Museums in Mumbai"), strictly find that category.

  Use Google Search to get real-time info.
  
  For each attraction:
  - Precise coordinates.
  - Real rating (0-5).
  - Actual opening hours.
  - 1 concise user review.
  - Source URL.
  
  Return RAW JSON Array:
  [
    {
      "id": "kebab-case-name",
      "name": "Name",
      "description": "Concise summary (max 15 words)",
      "category": "Category",
      "estimatedTime": "e.g. 2 hrs",
      "rating": 4.5,
      "openingHours": "9AM-5PM",
      "coordinates": { "lat": 12.34, "lng": 56.78 },
      "reviews": [{ "author": "Name", "comment": "Short text", "rating": 5 }],
      "sourceUrl": "https://..."
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable Search Grounding
        temperature: 0.3,
      },
    });

    let jsonStr = response.text || "[]";
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const arrayStart = jsonStr.indexOf('[');
    const arrayEnd = jsonStr.lastIndexOf(']');
    
    if (arrayStart !== -1 && arrayEnd !== -1) {
      jsonStr = jsonStr.substring(arrayStart, arrayEnd + 1);
      return JSON.parse(jsonStr) as Attraction[];
    }

    throw new Error("Failed to parse AI response");
  } catch (error) {
    console.error("Error fetching attractions:", error);
    throw error;
  }
};

/**
 * Generates a detailed itinerary with local insights.
 */
export const generateTripItinerary = async (
  location: string,
  selectedAttractions: Attraction[]
): Promise<GeneratedItinerary> => {
  const modelId = "gemini-2.5-flash"; 
  
  const attractionsContext = selectedAttractions.map(a => 
    `${a.name} (Hours: ${a.openingHours}, Location: ${a.coordinates.lat},${a.coordinates.lng})`
  ).join("\n");
  
  const prompt = `You are Yatra AI, an India-focused travel planning assistant.
  For the selected city/area "${location}" and places below, generate a complete itinerary.
  
  Attractions Selected:
  ${attractionsContext}
  
  Group visits by proximity.
  
  CRITICAL INSTRUCTION: 
  1. Do NOT mix information. Use the specific fields provided in the schema.
  2. For "suggestedStays", recommend 2 distinct accommodation options (Hotel, Resort, Hostel, or Camp) that are convenient for that specific day's location.
  
  Field Requirements:
  - description: Only describe the place and what to do there.
  - foodRecommendations: Specific local famous food spots (0-2km).
  - hiddenGems: Lesser-known spots nearby.
  - insiderTips: Best time to visit, crowd info, what to avoid.
  - transportation: Metro/Bus availability and estimated Auto/Cab fares.
  - safety: Tourist scams, night safety notes, traffic warnings.
  - budget: Cheap food spots, entry fees.
  - addOns: Walkable add-on places nearby.
  - travelEstimate: Time & Distance from previous spot (e.g. "15 min auto ride").
  
  Return strictly JSON matching the schema.`;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      overview: { type: Type.STRING },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            suggestedStays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  rating: { type: Type.NUMBER },
                  priceRange: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "type", "rating", "priceRange", "description"]
              }
            },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeOfDay: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING },
                  
                  // New Separated Fields
                  foodRecommendations: { type: Type.STRING },
                  hiddenGems: { type: Type.STRING },
                  insiderTips: { type: Type.STRING },
                  transportation: { type: Type.STRING },
                  travelEstimate: { type: Type.STRING },
                  safety: { type: Type.STRING },
                  budget: { type: Type.STRING },
                  addOns: { type: Type.STRING },

                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                    },
                    required: ["lat", "lng"]
                  },
                },
                required: [
                  "timeOfDay", "title", "description", "coordinates", 
                  "foodRecommendations", "hiddenGems", "insiderTips", 
                  "transportation", "safety", "budget", "addOns"
                ]
              }
            }
          },
          required: ["day", "segments", "suggestedStays"]
        }
      }
    },
    required: ["title", "overview", "days"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedItinerary;
    }
    throw new Error("Failed to generate itinerary");
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};