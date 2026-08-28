import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './context/useAuth';

function AppContent() {
  const [page, setPage] = useState<'login' | 'register'>('login');

  return (
    <main>
      {page === 'login' ? (
        <LoginPage onNavigateToRegister={() => setPage('register')} />
      ) : (
        <RegisterPage onNavigateToLogin={() => setPage('login')} />
      )}
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
