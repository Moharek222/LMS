import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/useAuth';

function App() {
  return (
    <AuthProvider>
      <main>
        <LoginPage />
      </main>
    </AuthProvider>
  );
}

export default App;
