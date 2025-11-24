'use client'
import React, { useState, useEffect, useRef } from 'react';

// =================================================================
// 1. DETAILED CONTEXT (The Agent's Knowledge Base)
// =================================================================
const DETAILED_CONTEXT = `
### Oligopoly Market Structure

1. **Definition and Meaning**
Literal Meaning: The term "oligopoly" comes from the Greek word oligos (meaning few), literally translating to "competition among the few."
Behavior over Structure: While it is structurally defined as a market containing a few firms, economists prefer to define it by **market conduct (behavior)**.
Key Characteristics:
* **Interdependence:** This is the defining feature. Firms must take into account the likely reactions of their rivals when making decisions about price or output. Game theory is particularly useful for mapping this interdependence in detail.
* **Uncertainty:** Because of interdependence, a firm can never be completely certain how rivals will react to its strategic moves.

2. **Measuring Market Structure**
To objectively identify an oligopoly, economists use **Concentration Ratios**, which measure the market share of the largest firms in an industry.
Calculation: A "five-firm concentration ratio" adds up the market percentage of the five largest firms.
Examples:
* UK Banking: In 2021, the six largest banks had a five-firm concentration ratio of 94%.
* Web Browsers: The European market is highly concentrated, with a four-firm ratio of over 91% (Chrome, Safari, Firefox, Edge).

3. **Theoretical Models of Behavior**
Two primary models explain how oligopolies behave, specifically regarding price stability and strategy.

A. **The Kinked Demand Curve:**
Purpose: This model explains **price rigidity**—why prices tend to stay stable even when costs change.
The Theory:
* If a firm raises its price, it assumes rivals will not follow. The firm loses market share, meaning demand is **elastic** (sensitive to price).
* If a firm cuts its price, it assumes rivals will match the cut to avoid losing customers. The firm gains very few sales, meaning demand is **inelastic** (insensitive to price).
* The "Kink": These differing assumptions create a "kink" in the demand curve at the current price. This causes a vertical gap in the **Marginal Revenue (MR) curve**, meaning **Marginal Costs (MC)** can fluctuate without changing the optimal price.

B. **Game Theory (The Prisoner's Dilemma):** Purpose: This provides a more detailed analysis of strategic interdependence than the kinked demand curve.
The Scenario: Imagine two firms (Firm A and Firm B) deciding between a High Price (£1) and a Low Price (90p).
* **Best Joint Outcome:** Both charge High Price (e.g., £3m each).
* **Dominant Strategy:** To avoid the "worst-case" scenario of being undercut, the rational choice for both firms is to charge the Low Price.
* **Nash Equilibrium:** Both firms end up charging the Low Price. This creates a stable equilibrium (price rigidity) where neither has an incentive to change, even though they make less profit than if they had colluded.

4. **Strategic Behavior: Competition vs. Collusion**
Firms constantly balance the urge to compete against the temptation to collude.

* **Competitive (Non-Collusive) Oligopoly:** Firms act independently. Prices often stay stable (Price Rigidity), leading to **Non-Price Competition** (branding, advertising, service, and product quality).
* **Collusive Oligopoly:** Firms cooperate to reduce uncertainty and maximize joint profits, effectively acting like a monopoly.
    * **Cartels:** A formal agreement (often illegal) to fix prices or restrict output. They aim for Joint-Profit Maximization, setting industry output where industry **Marginal Revenue** equals **Marginal Cost**.
    * **The Incentive to Cheat:** Game theory shows that collusion is unstable. Every member has a strong financial incentive to secretly undercut the others (cheat) to steal market share and boost profit.

5. **Pricing Strategies**
* **Price Leadership:** A form of tacit collusion where a dominant firm sets the price and smaller firms follow.
* **Price Wars:** Firms continuously cut prices to undercut rivals, which benefits consumers short-term but can lead to less competition later.
* **Price Discrimination:** Charging different prices to different consumers for the same product based on willingness to pay.

6. **Advantages and Disadvantages**
* **Advantages:** Economies of Scale, Innovation (dynamic efficiency), and simplicity in consumer choices.
* **Disadvantages:** High Prices (due to collusion), Inefficiency (cartels protect weak firms), and high **Barriers to Entry** for new competitors.

7. **Real-World Applications**
* Supermarkets: "Hard discounters" (Aldi, Lidl) compete on low costs, making it hard for traditional giants (Tesco) to compete purely on price.
* Book Market: The shift from fixed prices (Retail Price Maintenance) to aggressive discounting by giants (Amazon) has forced many small independent bookshops to close.
* Regulation: Some countries ban heavy discounting (e.g., France on books) to protect small shops.
`;

// =================================================================
// 2. SYSTEM INSTRUCTION (The Agent's Persona and Rules)
// =================================================================

const SYSTEM_INSTRUCTION = `
# YOUR ROLE: Specialized Economics Tutor
You are a strict and focused Economics Tutor specializing in the Oligopoly Market Structure. Your goal is to teach the user using *only* the provided context.

## **CORE DIRECTIVES**
1. **SOURCE OF TRUTH:** You must ONLY use the "Detailed Context" provided below to answer questions. Do not use external knowledge about other economic topics or general world knowledge.
2. **STRICTLY ON-TOPIC:** You must refuse to answer any question that is not related to Oligopolies or the provided text.
3. **TEACHER PERSONA:** Explain concepts clearly using the definitions provided. Use headings and bullet points for readability.

## **BEHAVIORAL RULES**
* **Refusal:** If the user asks an off-topic question (e.g., "What is the capital of France?", "Write me a poem", "What is Perfect Competition?"), you MUST politely refuse.
    * *Refusal Example:* "I am specialized only in the Oligopoly market structure. I cannot assist with other topics. Let's discuss Kinked Demand Curves or Game Theory instead."
* **Context adherence:** If the answer is not in the text provided, state that the information is not available in your current knowledge base.
`;

// 3. Define the Message Interface/Type
interface Message {
  id: number;
  sender: 'user' | 'model';
  text: string;
  time: string;
}

//Initial Data
const CONTACT = { id: 1, name: "Economics Tutor (Oligopoly)", status: "Online" };
const INITIAL_MESSAGES: Message[] = [
  { id: 1, sender: 'model', text: "Welcome! I am your tutor on the topic of Oligopoly. Ask me anything about the provided economic context.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    const newUserMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: trimmedInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const historyBeforeCall = [...messages, newUserMessage];

    // Update the UI
    setMessages(historyBeforeCall);
    setInputText("");
    setIsTyping(true); //for response

    // Check if this is the very first API call 
    // (history has the model's initial message + the new user message)
    const isFirstCall = historyBeforeCall.length === INITIAL_MESSAGES.length + 1;

    // 1. Prepare the payload structure
    const conversationHistory = historyBeforeCall.map(msg => ({
      role: msg.sender,
      parts: [{ text: msg.text }]
    }));

    // 2. PROMPT STUFFING LOGIC (The "Code B" Strategy)
    // Instead of sending rules separately, we force them into the text of the first message.
    if (isFirstCall) {
      // Find the index of the message the user just sent (it should be the last one)
      const lastMsgIndex = conversationHistory.length - 1;
      const userOriginalQuestion = conversationHistory[lastMsgIndex].parts[0].text;

      // Construct the "Mega-Prompt"
      const megaPrompt = `
${SYSTEM_INSTRUCTION}

--- START OF KNOWLEDGE BASE (DETAILED CONTEXT) ---
${DETAILED_CONTEXT}
--- END OF KNOWLEDGE BASE ---

--- USER QUESTION ---
${userOriginalQuestion}
      `;

      // Replace the simple user text with the Mega-Prompt in the payload ONLY.
      // The UI still shows the simple question, but the Model sees the full rules.
      conversationHistory[lastMsgIndex].parts[0].text = megaPrompt;
    }

    try {
      // Call the local API route
      const response = await fetch("/api/chatLogic", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // We only send conversationHistory now. The System Instruction is already "stuffed" inside it.
        body: JSON.stringify({
          conversationHistory
        })
      });

      // 3. Handle the API response
      const data = await response.json();

      if (response.ok) {
        const aiReply: Message = {
          id: Date.now() + 1,
          sender: 'model',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiReply]);
      } else {
        console.error("API Call Error:", data.message);
        const errorMessage: Message = {
          id: Date.now() + 1,
          sender: 'model',
          text: `[Error: ${data.message || 'Could not fetch response.'}]`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error("Network or Unexpected Error:", error);
      const networkError: Message = {
        id: Date.now() + 1,
        sender: 'model',
        text: "Network failure. Please check your connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, networkError]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans mx-auto max-w-3xl border-x border-gray-200 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10 rounded-t-xl">
        <h1 className="font-bold text-lg text-gray-800">{CONTACT.name}</h1>
        <span className="text-sm text-green-600 flex items-center">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
          {CONTACT.status}
        </span>
      </div>

      {/* Messages box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-xl shadow-sm transition-all duration-300
                                ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                }`}
            >
              <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'} text-right`}>{msg.time}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-3 rounded-xl rounded-tl-none bg-gray-100 text-gray-400 text-sm italic shadow-sm animate-pulse">
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input field */}
      <div className="p-4 border-t border-gray-300 bg-white sticky bottom-0 rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isTyping ? "Please wait..." : "Ask me about Oligopoly..."}
            disabled={isTyping}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black disabled:bg-gray-200 transition duration-150"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`px-6 py-3 rounded-xl font-semibold border transition duration-150 shadow-md
                        ${!inputText.trim() || isTyping
                ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}