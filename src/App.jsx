import { useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
