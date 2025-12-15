import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

// ------------------------------------------
// In-Memory WAV Conversion (Vercel-Safe)
// ------------------------------------------

// function convertToWavBuffer(pcmData) {
//    return new Promise((resolve, reject) => {
//       const buffers = [];
//       const writable = new Writable({
//          write(chunk, encoding, callback) {
//             buffers.push(chunk);
//             callback();
//          }
//       });

//       writable.on('finish', () => resolve(Buffer.concat(buffers)));
//       writable.on('error', reject);

//       const writer = new WavWriter({ // <--- Changed from new FileWriter(...)
//          channels: 1,
//          sampleRate: 24000,
//          bitDepth: 16,
//       });

//       writer.pipe(writable);
//       writer.end(pcmData);
//    });
// }

// This creates a valid WAV header without external dependencies.
// Standard PCM Audio: 1 Channel (Mono), 24000 Hz, 16-bit
function createWavHeader(sampleRate, dataLength) {
   const buffer = Buffer.alloc(44);

   // 1. RIFF chunk descriptor
   buffer.write('RIFF', 0);
   buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize = 36 + DataLength
   buffer.write('WAVE', 8);

   // 2. fmt sub-chunk
   buffer.write('fmt ', 12);
   buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
   buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
   buffer.writeUInt16LE(1, 22); // NumChannels (1 = Mono)
   buffer.writeUInt32LE(sampleRate, 24); // SampleRate
   buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate = SampleRate * NumChannels * BitsPerSample/8 (24000 * 1 * 2 = 48000)
   buffer.writeUInt16LE(2, 32); // BlockAlign = NumChannels * BitsPerSample/8 (1 * 2 = 2)
   buffer.writeUInt16LE(16, 34); // BitsPerSample

   // 3. data sub-chunk
   buffer.write('data', 36);
   buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size = NumBytes of data

   return buffer;
}

// ------------------------------------------
// Core TTS Function
// ------------------------------------------

/**
 * Generates audio for a given text and returns the complete WAV buffer.
 * @param {string} text The text to be converted to speech.
 * @returns {Promise<Buffer>} The WAV audio file as a Node.js Buffer.
 */
export async function generateAudioBuffer(text) {
   if (!text) {
      throw new Error("Text cannot be empty for audio generation.");
   }

   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
         responseModalities: ['AUDIO'],
         speechConfig: {
            voiceConfig: {
               prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
         },
      },
   });

   const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

   if (!data) {
      throw new Error("Gemini did not return audio data.");
   }

   // 1. Decode Base64 to raw L16 PCM data
   const pcmData = Buffer.from(data, 'base64');

   // 2. Create the correct WAV Header
   // Gemini 2.5 TTS Output is consistently 24000Hz, Mono
   const wavHeader = createWavHeader(24000, pcmData.length);

   // 3. Concatenate Header + PCM Data
   const wavBuffer = Buffer.concat([wavHeader, pcmData]);

   return wavBuffer;
}