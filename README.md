# 🧠 FlowAI Builder

FlowAI Builder is a minimalist, production-ready MERN stack application designed to visualize and execute AI-powered workflows. By leveraging **React Flow**, users can intuitively connect a text prompt node to an AI response node, execute queries through **OpenRouter**, and persist successful interactions to **MongoDB**.

---

## 🎯 Purpose & Problem Statement
Developing AI-integrated applications often involves complex UI state management and backend proxy logic to protect API keys. FlowAI solves this by providing:
- **Visual Clarity**: Direct visualization of the prompt-to-response relationship.
- **Backend Safety**: A dedicated Node server to handle OpenRouter credentials.
- **Persistence**: A simple way to archive effective prompts for later use.

---

## 🔥 Key Features
- **Intuitive UI**: A clean, Vercel-inspired professional interface.
- **Dynamic AI Nodes**: Custom React Flow nodes for text input and AI output.
- **Model Selector**: A dropdown that dynamically fetches available **Free AI Models** from OpenRouter.
- **Availability Tracking**: Real-time indication and disabling of unavailable models.
- **In-Node Loading**: Integrated CSS loaders within response nodes for immediate visual feedback.
- **MongoDB Persistence**: One-click saving of prompt-response pairs.
- **Fully Responsive**: Mobile-optimized layouts for the flow builder and header.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Lightning-fast build and development server.
- **React Flow**: Powerful library for building node-based editors.
- **Axios**: Promised-based HTTP client for backend communication.
- **React Hot Toast**: Minimalist toast notifications for status updates.

### Backend
- **Node.js**: Asynchronous event-driven JavaScript runtime.
- **Express.js**: Minimal and flexible web application framework.
- **Mongoose**: ODM for MongoDB to handle structured data schema.

### Database
- **MongoDB Atlas**: Fully managed cloud database for data persistence.

### AI Integration
- **OpenRouter API**: Aggregator for multiple AI providers (optimized for free-tier models).

---

## 📁 Project Structure

```text
FlowAI/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment & global configs
│   │   ├── controllers/  # Route logic handlers
│   │   ├── db/           # MongoDB connection logic
│   │   ├── middleware/   # Request processing (ErrorHandler)
│   │   ├── models/       # Mongoose Schemas (Response)
│   │   ├── routes/       # API endpoint definitions
│   │   ├── services/     # OpenRouter & logic abstractions
│   │   └── utils/        # Shared helper functions
│   └── .env              # Backend secrets (ignored by git)
└── frontend/
    ├── src/
    │   ├── api/          # Axios instance & interceptors
    │   ├── features/     # Logic-focused components (Flow Nodes)
    │   ├── pages/        # Main route views (FlowBuilder)
    │   └── App.jsx       # Root component & Toast providers
    └── vite.config.js    # Vite environment settings
```

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas Cluster** (or local MongoDB instance)
- **OpenRouter API Key**

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

---

## ⚡ How to Run

### Development Mode
Open two terminals and execute:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
The application will be live at `http://localhost:5173`.

---

## 📟 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/models` | Fetches the current list of available free OpenRouter models. |
| **POST** | `/api/ask-ai` | Executes a prompt against the selected or auto-determined AI model. |
| **POST** | `/api/save` | Saves the prompt and AI response to the database. |

---

## 📖 Usage Guide
1. **Model Selection**: Choose an AI model from the top dropdown (or leave it as "Auto Select").
2. **Input Prompt**: Type your question or instruction in the **Input Prompt** node on the left.
3. **Execution**: Click **Run Flow**. A spinner will appear in the **AI Response** node header while processing.
4. **Result**: The AI output will be displayed in the right-hand node.
5. **Save**: Click **Save Record** to persist the result to MongoDB. A toast notification will confirm success.

---

## 🛠️ Scripts

### Backend
- `npm run dev`: Starts the server using `nodemon` for hot-reloading.

### Frontend
- `npm run dev`: Launches the Vite development server.
- `npm run build`: Generates the production-ready distribution bundle.
- `npm run lint`: Runs ESLint for code quality checks.

---

## 🔮 Future Roadmap
- [ ] Add sidebar to view and search previously saved interactions.
- [ ] Implement user authentication for private project saving.
- [ ] Support multi-node complex flows with conditional logic.
- [ ] Add PDF/Markdown export for generated responses.

---

## 📄 License
This project is licensed under the **MIT License**.

---

## ✨ Developed By
[Your Name] - [Your Portfolio Site/LinkedIn]
