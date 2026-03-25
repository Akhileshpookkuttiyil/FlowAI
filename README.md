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
FRONTEND_URL=http://localhost:5173
OPENROUTER_SITE_URL=http://localhost:5173
OPENROUTER_APP_NAME=FlowAI Builder
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:5000
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
- `npm start`: Starts the production Express server.
- `npm run dev`: Starts the server using `nodemon` for hot-reloading.

### Frontend
- `npm run dev`: Launches the Vite development server.
- `npm run build`: Generates the production-ready distribution bundle.
- `npm run lint`: Runs ESLint for code quality checks.

---

## Deployment

### Frontend on Vercel
1. Import the `frontend/` directory as the Vercel project root.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add `REACT_APP_API_URL=https://your-render-backend.onrender.com` in Vercel Environment Variables.
5. Redeploy after saving the environment variable.

### Backend on Render
1. Create a new Web Service pointing at the `backend/` directory.
2. Set the start command to `npm start`.
3. Add environment variables:
```env
MONGO_URI=your_mongodb_atlas_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
FRONTEND_URL=https://your-vercel-frontend.vercel.app
OPENROUTER_SITE_URL=https://your-vercel-frontend.vercel.app
OPENROUTER_APP_NAME=FlowAI Builder
PORT=10000
```
4. After Vercel gives you the frontend production domain, update `FRONTEND_URL` on Render so CORS allows the deployed app.

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
- **Akhilesh P**
- **Role:** Software Developer | MERN Stack
- **Portfolio:** https://akhilesh-dev.vercel.app
- **LinkedIn:** https://linkedin.com/in/akhilesh-p-dev
- **GitHub:** https://github.com/Akhileshpookkuttiyil
- **Email:** akhileshpookkuttiyil@gmail.com
