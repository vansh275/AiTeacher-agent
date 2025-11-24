import { NextResponse } from "next/server";
export async function POST(req: Request) {
    const body = await req.json();
    const { conversationHistory } = body;

    const API = process.env.API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: conversationHistory })
    });
    const data = await response.json();
    if (!response.ok || data.error) {
        console.error("Gemini API Error:", data.error || data);
        return NextResponse.json(
            { text: `Error: ${data.error?.message || 'External API Failure'}`, message: data.error?.message || 'External API Failure' },
            { status: response.status >= 400 ? response.status : 500 }
        );
    }
    const generatedText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't generate a response.";
    // console.log("res aya ", generatedText);
    return NextResponse.json(
        // We return an object with the key 'text' matching what the frontend expects
        { text: generatedText },
        { status: 200 }
    );

};