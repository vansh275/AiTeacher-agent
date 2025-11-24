**LIVE:** [LINK](https://ai-teacher-agent.vercel.app/) 
# AI Teacher Agent - Economics Tutor (Oligopoly)

A specialized AI tutoring agent built with Next.js 16 that focuses strictly on the **Oligopoly Market Structure**. This application uses Google's Gemini 2.0 Flash model to act as a strict, focused economics teacher, utilizing a "context-stuffing" approach to ensure responses remain factual and within the bounds of the provided curriculum.

## 🚀 Features

* **Specialized Knowledge Base:** The agent is pre-prompted with detailed context regarding Oligopolies (Kinked Demand Curve, Game Theory, Concentration Ratios, etc.).
* **Strict Persona:** The AI acts as a tutor, refusing to answer off-topic questions (e.g., general knowledge, poetry) to keep the student focused.
* **Modern UI:** A clean, responsive chat interface built with React 19 and Tailwind CSS v4.
* **Real-time Streaming:** Fast responses utilizing the Gemini 2.0 Flash API.
* **Next.js 16:** Built on the latest Next.js App Router architecture.

## 🛠️ Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **AI Model:** Google Gemini 2.0 Flash (via Google Generative AI API)
* **State Management:** React Hooks (`useState`, `useEffect`)

## 🤖 AI-Accelerated Development

**Transparency Note:**
To significantly speed up the development lifecycle, the **Frontend User Interface (UI)** were developed with the assistance of AI coding tools. This approach allowed for rapid prototyping of the chat interface while focusing human effort on the prompt engineering, logic constraints, and backend integration.

## ⚖️ Fair AI Use Policy

This application is designed as an **educational supplement**, and users are encouraged to adhere to the following guidelines:

1.  **Verification:** While the agent relies on a specific knowledge base, AI models can occasionally hallucinate. Students should verify key economic definitions with their official textbooks or lecture notes.
2.  **Academic Integrity:** This tool is intended to explain complex concepts (like the Nash Equilibrium) and help students practice. It should **not** be used to generate essays, complete homework assignments automatically, or bypass critical thinking.
3.  **Topic Limitation:** The agent is deliberately programmed to refuse questions outside the scope of Oligopolies to ensure high-quality, relevant answers. This is a feature, not a bug, designed to prevent distraction and misuse.

## 📦 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone (https://github.com/vansh275/AiTeacher-agent.git)
### 2. move to AiTeacher-agent
cd AiTeacher-agent
### 3. install dependencies
npm install 
### 3.1 You will need API key so make .env file and put ypu api key like this
API_KEY="<your_key>"
### 4. Now run
npm run dev