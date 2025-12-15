import { NextResponse } from "next/server";
// Import the context and instructions from the new file
import { DETAILED_CONTEXT, SYSTEM_INSTRUCTION } from "../../knowledge_base"; // Note the relative path might need adjustment based on where you place knowledge_base.ts
import { generateAudioBuffer } from "../textToSpeech/route";
export async function POST(req: Request) {
    const body = await req.json();
    const { conversationHistory } = body;
    const { wantAudio } = body;

    const API = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API}`;

    if (!API) {
        return NextResponse.json(
            { text: `Error: API_KEY is missing.`, message: 'External API Key is missing.' },
            { status: 500 }
        );
    }

    // 1. Extract the last user question for clarity (although we send the whole history)
    // const userQuestion = conversationHistory[conversationHistory.length - 1]?.parts?.[0]?.text || "Hello.";

    // 2. Format the previous conversation history into a single string
    const historyString = conversationHistory
        .map((msg: { role: string, parts: { text: string }[] }) =>
            `${msg.role === 'user' ? 'User' : 'Tutor'}: ${msg.parts[0].text}`
        )
        .join('\n');

    // 3. Assemble the "Mega-Prompt" (Context Stuffing)
    const megaPrompt = `
${SYSTEM_INSTRUCTION}

--- KNOWLEDGE BASE (Use ONLY this to form your answer) ---
${DETAILED_CONTEXT}
--- END OF KNOWLEDGE BASE ---

--- RECENT CONVERSATION HISTORY (for context) ---
${historyString}
--- END OF RECENT CONVERSATION HISTORY ---

Based ONLY on the KNOWLEDGE BASE and your role as a tutor, respond to the last User query in the conversation history above. Your response:
    `;

    // 4. Create the final payload to send to Gemini
    // We send the entire Mega-Prompt as the single, current 'user' message to ensure the model sees the context.
    const finalContents = [
        {
            role: 'user',
            parts: [{ text: megaPrompt }]
        }
    ];

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: finalContents })
        });

        const data = await response.json();
        if (!response.ok || data.error) {
            console.error("Gemini API Error:", data.error || data);
            return NextResponse.json(
                { text: `[Error: ${data.error?.message || 'External API Failure'}]`, message: data.error?.message || 'External API Failure' },
                { status: response.status >= 400 ? response.status : 500 }
            );
        }

        const generatedText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't generate a response.";
        if (wantAudio) {
            // 2. Generate the Audio Buffer
            const wavBuffer = await generateAudioBuffer(generatedText);
            // 3. Convert the WAV Buffer to a Base64 string for safe JSON transmission
            const audioBase64 = wavBuffer.toString('base64');

            // 4. Return the Base64 string and metadata in your JSON response
            return new Response(JSON.stringify({
                text: generatedText,
                audioData: audioBase64,
                audioMimeType: 'audio/wav',
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        // console.log("res aya ", generatedText);
        return NextResponse.json(
            { text: generatedText },
            { status: 200 }
        );

    } catch (error) {
        console.error("Network or Unexpected Error:", error);
        return NextResponse.json(
            { text: "Network failure. Please check your connection.", message: "Network/Fetch Error" },
            { status: 500 }
        );
    }
}