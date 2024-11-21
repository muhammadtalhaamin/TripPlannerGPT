import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are a travel planning assistant that always responds with valid JSON data that exactly matches the specified structure.`;

const createUserPrompt = (destination, budget, travelWith) => `Create a list of three recommended hotels in ${destination} for ${travelWith}, with a ${budget} budget.
The response MUST strictly follow this exact JSON structure:

{
  "hotels": [
    {
      "name": "Hotel name",
      "address": "Hotel address",
      "description": "Brief description",
      "coordinates": {
        "latitude": "lat",
        "longitude": "long"
      },
      "amenities": ["amenity1", "amenity2"]
    }
  ]
}

Requirements:
1. Include exactly three hotels
2. All image URLs must be "/api/placeholder/800/600"
3. Keep all text descriptions under 100 characters
4. All coordinates must be provided
5. All prices must be in USD`;

export async function POST(request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { destination, budget, travelWith } = body;

    if (!destination || !budget || !travelWith) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: createUserPrompt(destination, budget, travelWith) }
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

    const hotelData = JSON.parse(content);

    // Validate the response structure
    if (!hotelData.hotels || !Array.isArray(hotelData.hotels) || hotelData.hotels.length !== 3) {
      throw new Error('Invalid response structure from AI');
    }

    return NextResponse.json(hotelData);

  } catch (error) {
    const status =
      error.code === 'insufficient_quota' || error.code === 'rate_limit_exceeded' ? 429 :
      error.response?.status === 401 ? 401 : 500;

    return NextResponse.json(
      {
        error: 'Failed to generate hotel recommendations',
        details: error.message,
        source: 'API route error handler'
      },
      { status }
    );
  }
}