import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Attraction, GeneratedItinerary } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Searches for top attractions in a given location using Gemini with Google Search Grounding.
 * Note: When using tools, we cannot use responseSchema, so we parse JSON manually.
 */
export const searchAttractionsInLocation = async (location: string): Promise<Attraction[]> => {
  const modelId = "gemini-2.5-flash"; 

  // Optimized for speed: 
  // 1. Reduced item count from 10 to 8.
  // 2. Requested single, concise review.
  // 3. Constrained description length.
  const prompt = `Fast search: Find 8 top tourist attractions in ${location}, India. 
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
        temperature: 0.3, // Slightly lower temp for faster/more deterministic output
      },
    });

    // Extract JSON from potential Markdown formatting
    let jsonStr = response.text || "[]";
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Find the array brackets in case there is conversational text
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
 * Generates a detailed itinerary based on selected attractions.
 * We keep Schema here for strict structural validation of the complex itinerary object.
 */
export const generateTripItinerary = async (
  location: string,
  selectedAttractions: Attraction[]
): Promise<GeneratedItinerary> => {
  const modelId = "gemini-2.5-flash"; 
  
  // Pass the enriched attraction data (which has real hours/ratings) to the planner
  const attractionsContext = selectedAttractions.map(a => 
    `${a.name} (Hours: ${a.openingHours}, Location: ${a.coordinates.lat},${a.coordinates.lng})`
  ).join("\n");
  
  const prompt = `Create a logical, efficient travel itinerary for visiting these places in ${location}:
  ${attractionsContext}
  
  Group visits by proximity. Suggest generic lunch/dinner spots near attractions.
  
  For every segment:
  1. Provide coordinates.
  2. Provide "travelEstimate" (e.g., "15 min drive") from previous location.
  
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
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeOfDay: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING },
                  tips: { type: Type.STRING },
                  travelEstimate: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                    },
                    required: ["lat", "lng"]
                  },
                },
                required: ["timeOfDay", "title", "description", "coordinates"]
              }
            }
          },
          required: ["day", "segments"]
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
        temperature: 0.5,
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