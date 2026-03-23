import FlowBuilder from "./pages/FlowBuilder";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Toaster position="bottom-right" />
      <FlowBuilder />
    </div>
  );
}

export default App;