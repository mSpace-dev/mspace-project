

// Use the Node.js runtime for this API route
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server"

// Configuration - Replace with your actual hosted model URL
const HOSTED_MODEL_URL = "http://localhost:8000"; // Replace with your actual hosted URL
// Example: const HOSTED_MODEL_URL = "https://your-model-api.herokuapp.com";
// Example: const HOSTED_MODEL_URL = "https://your-domain.com";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validate required fields
    const requiredFields = ['crop', 'district', 'dayOfWeek', 'supply', 'prevPrice', 'prevDemand', 'retailPrice'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Convert form data to the format expected by the hosted FastAPI model
    const inputData = {
      crop: data.crop,
      district: data.district,
      dayOfWeek: data.dayOfWeek,
      weather: data.weather || "Sunny", // Default to Sunny if not provided
      supply: parseFloat(data.supply),
      prevPrice: parseFloat(data.prevPrice),
      prevDemand: parseFloat(data.prevDemand),
      festivalWeek: data.festivalWeek ? 1 : 0,
      retailPrice: parseFloat(data.retailPrice),
    }

    // Validate numeric fields
    const numericFields = ['supply', 'prevPrice', 'prevDemand', 'retailPrice'];
    for (const field of numericFields) {
      if (isNaN(inputData[field as keyof typeof inputData] as number)) {
        return NextResponse.json({ error: `Invalid numeric value for ${field}` }, { status: 400 });
      }
    }

    console.log('Sending request to hosted model:', inputData);

    // Call the hosted FastAPI model
    const response = await fetch(`${HOSTED_MODEL_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hosted model error:', response.status, errorText);
      return NextResponse.json({ 
        error: `Prediction service error: ${response.status}` 
      }, { status: 500 });
    }

    const prediction = await response.json();
    console.log('Received prediction:', prediction);

    // Return the prediction result
    return NextResponse.json({
      predictedPrice: prediction.predictedPrice,
      predictedDemand: prediction.predictedDemand,
      status: prediction.status || "success"
    });

  } catch (error) {
    console.error("API error:", error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({ 
        error: "Unable to connect to prediction service. Please check if the model is running." 
      }, { status: 503 });
    }

    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}