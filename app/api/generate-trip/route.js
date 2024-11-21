// app/api/generate-trip/route.js
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a travel planning assistant that always responds with valid JSON data that exactly matches the specified structure.`;

const createUserPrompt = (destination, day, budget, travelWith, usedPlaces, usedMeals) => {
  return `Create day ${day} of the itinerary for a ${destination} trip (${travelWith}, ${budget} budget).

  Requirements:
  1. Include three activities and three meals (breakfast, lunch, dinner) for the day.
  2. Ensure no repetition of places or meals across different days.
  3. Provide all necessary details as specified in the structure.
  4. Keep all text descriptions under 100 characters.
  5. All coordinates must be provided.
  6. All prices must be in USD.
  7. Avoid places and meals already used in previous days: ${usedPlaces.join(", ")}, ${usedMeals.join(",")}.

  Response structure:
  {
    "day": ${day},
    "activities": [
      {
        "time": "Time (e.g., 09:00 AM)",
        "placeName": "Place name",
        "placeDetails": "Brief details",
        "placeImageUrl": "/api/placeholder/800/600",
        "coordinates": {
          "latitude": "lat",
          "longitude": "long"
        },
        "ticketPrice": "Price in USD or Free",
        "duration": "Duration",
        "tips": "Brief tip"
      },
      // Two more activities
    ],
    "meals": [
      {
        "type": "breakfast",
        "restaurantName": "Restaurant name",
        "cuisine": "Cuisine type",
        "priceRange": "Price in USD",
        "coordinates": {
          "latitude": "lat",
          "longitude": "long"
        }
      },
      {
        "type": "lunch",
        // Lunch details
      },
      {
        "type": "dinner",
        // Dinner details
      }
    ]
  }`;
};

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { destination, day, budget, travelWith, usedPlaces, usedMeals } = body;

    if (!destination || !day || !budget || !travelWith) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: createUserPrompt(destination, day, budget, travelWith, usedPlaces, usedMeals) }
      ],
      model: "gpt-3.5-turbo-1106",
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    const dayPlan = JSON.parse(content);

    // Validate the response structure
    if (!dayPlan.day || !dayPlan.activities || !Array.isArray(dayPlan.activities) ||
        dayPlan.activities.length !== 3 ||
        !dayPlan.meals || !Array.isArray(dayPlan.meals) ||
        dayPlan.meals.length !== 3) {
      throw new Error('Invalid response structure from AI');
    }

    return NextResponse.json(dayPlan);

  } catch (error) {
    const status =
      error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded' ? 429 :
      error.response?.status === 401 ? 401 : 500;

    return NextResponse.json(
      {
        error: 'Failed to generate day plan',
        details: error.message,
        source: 'API route error handler'
      },
      { status }
    );
  }
}