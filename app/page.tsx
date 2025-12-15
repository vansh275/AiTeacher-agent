'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// ==========================================
// 1. TYPES & CONSTANTS
// ==========================================

interface Message {
  id: number;
  sender: 'user' | 'model';
  text: string;
  time: string;
}

type AppMode = 'idle' | 'dictation' | 'live';

const CONTACT = { id: 1, name: "Economics Tutor (Oligopoly)", status: "Online" };

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    sender: 'model',
    text: "Welcome! I am your tutor on the topic of Oligopoly. Ask me anything.",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
];

// ==========================================
// 2. CUSTOM HOOK: Text-To-Speech (TTS)
// ==========================================
// Handles the browser's speech synthesis independently

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      alert('Browser does not support TTS');
      return;
    }

    // Cancel any current audio
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // Normal speed

    // Optional: Select a specific voice if desired
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices[0]; 

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, cancel };
};

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

const ChatHeader = () => (
  <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10 rounded-t-xl">
    <h1 className="font-bold text-lg text-gray-800">{CONTACT.name}</h1>
    <span className="text-sm text-green-600 flex items-center">
      <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
      {CONTACT.status}
    </span>
  </div>
);

const MessageList = ({ messages, onSpeakMsg, isSpeaking }: { messages: Message[], onSpeakMsg: (txt: string) => void, isSpeaking: boolean }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[75%] px-4 py-3 rounded-xl shadow-sm relative ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'}`}>
            <button
              onClick={() => onSpeakMsg(msg.text)}
              disabled={isSpeaking}
              className={`absolute top-0 transform -translate-y-1/2 p-1 rounded-full text-xs shadow-md z-10 ${msg.sender === 'user' ? 'left-0 ml-1 bg-blue-400 text-white' : 'right-0 mr-1 bg-gray-300 text-gray-800'}`}
            >
              🔊
            </button>
            <p className="text-sm sm:text-base whitespace-pre-wrap mt-2">{msg.text}</p>
            <p className={`text-xs mt-1 text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>{msg.time}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// The Modal for Live Conversation
const LiveConversationModal = ({
  isOpen,
  onClose,
  transcript,
  listening,
  isAiSpeaking
}: {
  isOpen: boolean;
  onClose: () => void;
  transcript: string;
  listening: boolean;
  isAiSpeaking: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 text-center">
        <h2 className="text-xl font-bold text-blue-600">Live Conversation Mode</h2>

        <div className="text-lg font-semibold min-h-10">
          {listening ? (
            <span className="text-red-500 animate-pulse flex justify-center gap-2">🔴 Listening...</span>
          ) : isAiSpeaking ? (
            <span className="text-green-600 animate-bounce flex justify-center gap-2">🗣️ Tutor Speaking...</span>
          ) : (
            <span className="text-gray-500">⏳ Processing...</span>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 min-h-80 text-left">
          <p className="text-xs text-gray-500 mb-1">{listening ? 'You are saying:' : 'Captured:'}</p>
          <p className="text-gray-800">{transcript || "..."}</p>
        </div>

        <button onClick={onClose} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md w-full">
          End Live Chat
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. MAIN COMPONENT
// ==========================================

export default function Home() {
  // --- States ---
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<AppMode>('idle'); // 'idle' | 'dictation' | 'live'
  const [isProcessing, setIsProcessing] = useState(false); // API loading state
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [wantAiVoice, setWantAiVoice] = useState<boolean>(false);
  // --- Hooks ---
  const { isSpeaking, speak, cancel: cancelSpeech } = useTextToSpeech();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Helper function to decode and play Base64 audio
  const playBase64Audio = (
    base64String: string,
    mimeType: string,
    onEnded: () => void,
    onPlay: (audio: HTMLAudioElement) => void // 💡 NEW: Callback to save the audio object
  ): boolean => {
    try {
      // ... (Base64 decoding logic remains the same) ...
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.onended = onEnded;

      audio.play().then(() => {
        // 💡 Call the onPlay callback when playback successfully starts
        onPlay(audio);
      }).catch(e => {
        console.error("Error playing audio:", e);
        onEnded();
      });
      return true;
    } catch (e) {
      console.error("Error decoding or playing Base64 audio:", e);
      onEnded();
      return false;
    }
  };

  // --- Logic 1: Handle Dictation & Transcript Sync ---
  useEffect(() => {
    // If we are in 'dictation' mode, constantly update the input field
    if (mode === 'dictation' && listening) {
      setInputText(transcript);
    }
  }, [transcript, mode, listening]);


  // --- Logic 2: Live Mode Silence Detection (Auto-Send) ---
  useEffect(() => {
    if (mode !== 'live' || !listening || !transcript.trim()) return;

    // Detect silence: If no change in transcript for 1.5s, send the message
    const timer = setTimeout(() => {
      handleLiveSubmit(transcript);
    }, 1500);

    return () => clearTimeout(timer);
  }, [transcript, mode, listening]);


  // --- Logic 3: API & Message Handling ---

  /**
   * REAL API CALL
   * Sends the conversation history to the backend Next.js API route.
   */
  const fetchAIResponse = async (currentHistory: Message[]): Promise<{ text: string, audioBase64?: string, audioMimeType?: string }> => {

    try {
      // 1. Map frontend Message format to Backend Gemini format
      // Backend expects: { role: 'user' | 'model', parts: [{ text: string }] }
      const historyPayload = currentHistory.map((msg) => ({
        role: msg.sender,
        parts: [{ text: msg.text }]
      }));

      // 2. Make the POST request
      const wantAudio = mode === 'live' && wantAiVoice;
      // IMPORTANT: Ensure your backend file is at app/api/chat/route.ts
      const response = await fetch('/api/chatLogic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationHistory: historyPayload, wantAudio: wantAudio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.text || 'API Error');
      }
      return {
        text: data.responseText || data.text,
        audioBase64: data.audioData,
        audioMimeType: data.audioMimeType
      };

    } catch (error) {
      console.error("Fetch Error:", error);
      return {
        text: "I apologize, but I am unable to connect to the server right now.",
        audioBase64: undefined
      };
    }
  };

  const addMessage = (text: string, sender: 'user' | 'model') => {
    const newMsg: Message = {
      id: Date.now(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Triggered manually in Dictation/Idle OR automatically in Live
  const handleSendMessage = async (text: string): Promise<{ text: string, audioBase64?: string, audioMimeType?: string } | null> => {
    if (!text.trim()) return null;

    // 1. Create the new user message object
    const newUserMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 2. Optimistically update UI
    setMessages(prev => [...prev, newUserMsg]);
    setInputText("");
    resetTranscript();
    setIsProcessing(true);

    try {
      // 3. Create a temporary history array that INCLUDES the new message.
      // We cannot use 'messages' state directly here because the setState above is async 
      // and might not have updated by the time we call fetch.
      const conversationHistory = [...messages, newUserMsg];

      // 4. Call API with full history
      const aiResponse = await fetchAIResponse(conversationHistory);

      addMessage(aiResponse.text, 'model');
      return aiResponse;
    } catch (e) {
      addMessage("Error getting response.", 'model');
      console.log(e);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };


  // --- Logic 4: Orchestration for Live Mode ---

  const handleLiveSubmit = async (text: string) => {
    SpeechRecognition.stopListening(); // Stop mic while processing
    const audioResponse = await handleSendMessage(text);
    if (!audioResponse) return;

    if (!wantAiVoice) {
      setTimeout(() => {
        speak(audioResponse.text, () => {
          setTimeout(() => {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
          })
        })
      })
      return;
    }
    if (!audioResponse?.audioBase64 && mode === 'live') {
      speak("couldn't connect to the api", () => {
        // Only restart if we are still in live mode
        // We use a timeout to prevent instant mic triggering
        setTimeout(() => {
          resetTranscript();
          SpeechRecognition.startListening({ continuous: true });
        }, 500);
      });
      return null;
    }
    if (!audioResponse?.audioBase64 && !audioResponse?.audioMimeType) {
      return;
    }
    const { audioBase64, audioMimeType } = audioResponse;
    // 2. Audio Playback Logic
    if (audioBase64 && audioMimeType) {

      const audioPlaybackCallback = () => {
        // This runs when the audio FINISHES playing
        setCurrentAudio(null); // Clear the reference
        setIsProcessing(false); // Finished processing

        // Restart mic after a short delay
        setTimeout(() => {
          resetTranscript();
          SpeechRecognition.startListening({ continuous: true });
        }, 500);
      };

      const onAudioPlay = (audioInstance: HTMLAudioElement) => {
        // This runs when the audio STARTS playing
        setCurrentAudio(audioInstance); // Save the audio instance to state
      };

      playBase64Audio(
        audioBase64,
        audioMimeType,
        audioPlaybackCallback,
        onAudioPlay // Pass the new handler
      );

    } else {
      // Fallback if audio wasn't generated
      setIsProcessing(false);
      setTimeout(() => {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true });
      }, 500);
    }
  };


  // --- Logic 5: Button Handlers ---

  const toggleDictation = () => {
    if (mode === 'dictation') {
      // Stop
      SpeechRecognition.stopListening();
      setMode('idle');
    } else {
      // Start
      setMode('dictation');
      resetTranscript();
      setInputText("");
      cancelSpeech(); // Stop any current TTS
      SpeechRecognition.startListening({ continuous: true });
    }
  };
  const toggleWantAiVoice = () => {
    setWantAiVoice(prev => !prev);
  }
  const startLiveMode = () => {
    cancelSpeech();
    setMode('live');
    resetTranscript();
    setInputText("");
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopLiveMode = () => {
    SpeechRecognition.stopListening();
    cancelSpeech();
    setMode('idle');
    resetTranscript();
  };

  const manualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'dictation') toggleDictation(); // Close dictation on send
    handleSendMessage(inputText);
  };

  // --- Logic 6: Cleanup on Unmount ---
  useEffect(() => {
    return () => {
      cancelSpeech();
      SpeechRecognition.stopListening();
    };
  }, [cancelSpeech]);

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser does not support speech recognition.</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans mx-auto max-w-3xl border-x border-gray-200 shadow-xl">

      <ChatHeader />

      <MessageList
        messages={messages}
        onSpeakMsg={(txt) => speak(txt)} // Simple Read Aloud
        isSpeaking={isSpeaking}
      />

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="px-6 py-2 bg-gray-50 text-xs text-gray-500 italic">
          AI is thinking...
        </div>
      )}

      {/* Bottom Controls */}
      <div className="p-4 border-t border-gray-300 bg-white sticky bottom-0 rounded-b-xl">
        <form onSubmit={manualSubmit} className="flex gap-2">

          {/* 1. Dictation Toggle */}
          <button
            type="button"
            onClick={toggleDictation}
            title={mode === 'dictation' ? "Stop Dictation" : "Start Dictation"}
            disabled={mode === 'live' || isProcessing}
            className={`p-3 rounded-xl transition shadow-md ${mode === 'dictation'
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {mode === 'dictation' ? '🛑' : '🎤'}
          </button>

          {/* 2. Live Conversation Button */}
          <button
            type="button"
            onClick={startLiveMode}
            title="Start Live Conversation"
            disabled={mode !== 'idle' || isProcessing}
            className={`p-3 rounded-xl transition shadow-md bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50`}
          >
            🗣️
          </button>
          <button
            type="button"
            onClick={toggleWantAiVoice}
            title="change voice type"
            className={`p-3 rounded-xl transition shadow-md border-2 ${wantAiVoice ? "border-green-500" : "border-black"
              }`}
          >
            👄
          </button>

          {/* 3. Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={mode === 'dictation' ? "Listening..." : "Type your message..."}
            disabled={mode === 'live' || isProcessing}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          />

          {/* 4. Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing || mode === 'live'}
            className="px-6 py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 transition shadow-md"
          >
            Send
          </button>
        </form>
      </div>

      {/* Live Mode Modal Overlay */}
      <LiveConversationModal
        isOpen={mode === 'live'}
        onClose={stopLiveMode}
        transcript={transcript}
        listening={listening}
        isAiSpeaking={isSpeaking || currentAudio !== null}
      />

    </div>
  );
}