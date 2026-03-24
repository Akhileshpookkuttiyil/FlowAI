import FlowBuilder from "./pages/FlowBuilder";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: "14px",
            border: "1px solid rgba(219, 228, 239, 0.92)",
            background: "rgba(255, 255, 255, 0.96)",
            color: "#0f172a",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            fontSize: "13px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <FlowBuilder />
    </div>
  );
}

export default App;
