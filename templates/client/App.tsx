import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';

function AppContent() {
  const { user, getAccessToken } = useContext(AuthContext);

  return (
    <div className="App">
      <header className="App-header">
        {user && (
          <div>
            <h1>Welcome, {user.username}!</h1>
            <p>Your access token is: {getAccessToken ? getAccessToken() : 'Not available'}</p>
          </div>
        )}
      </header>
    </div>
  );
}

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
