# FlowAI Builder

A MERN stack application where you can type a prompt into a visual flow node, run it through an AI, and save the result to MongoDB — all visualized with React Flow.

## Live Demo
🔗 [Add your deployed link here]

## Tech Stack
- **Frontend:** React 19 + Vite + React Flow + Axios
- **Backend:** Node.js + Express.js
- **Database:** MongoDB Atlas
- **AI:** OpenRouter API (free tier)

## Features
- 🧠 AI-powered prompt → response flow using OpenRouter
- 🔗 Visual node graph built with React Flow
- 💾 Save prompt & response pairs to MongoDB
- 🔔 Toast notifications for success/error states

## Getting Started

### Prerequisites
- Node.js v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account
- An [OpenRouter](https://openrouter.ai) API key (free)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/FlowAI.git
cd FlowAI
```

### 2. Backend setup
```bash
cd backend
npm install
npm run dev
```
Server runs on **http://localhost:5000**

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
App opens on **http://localhost:5173**

### Environment Variables
Create a `backend/.env` file with the following:
```
PORT=5000
OPENROUTER_API_KEY=your_openrouter_key_here
MONGO_URI=your_mongodb_atlas_uri_here
```

## How to Use
1. Type a prompt in the **Input Prompt** node on the canvas
2. Click **Run Flow** — the AI response appears in the **AI Response** node
3. Click **Save Record** to persist the prompt + response to MongoDB

## Project Structure
```
FlowAI/
├── backend/
│   └── src/
│       ├── config/       # Env config
│       ├── controllers/  # Route handlers
│       ├── db/           # MongoDB connection
│       ├── middleware/   # Error handler
│       ├── models/       # Mongoose schemas
│       ├── routes/       # Express routes
│       ├── services/     # OpenRouter API logic
│       └── utils/        # Async handler
└── frontend/
    └── src/
        ├── api/          # Axios instance
        ├── features/     # InputNode, OutputNode components
        └── pages/        # FlowBuilder main page
```
