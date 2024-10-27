import { useState, useEffect } from 'react';
import ProductManagement from './ProductManagement';
import { AuthClient } from "@dfinity/auth-client";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        handleAuthenticated(authClient);
      }
    };
    initAuth();
  }, []);

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943/",
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  };

  const logout = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
  };

  const handleAuthenticated = async (authClient) => {
    setIsAuthenticated(true);
    const identity = authClient.getIdentity();
    setPrincipal(identity.getPrincipal().toText());
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Product Manager</h1>
        <button className="logout-button" onClick={logout}>Logout</button>
        {isAuthenticated ? (
          <div>
            <p>Authenticated as: {principal}</p>
            <ProductManagement />
          </div>
        ) : (
          <button onClick={login}>Login with Internet Identity</button>
        )}
      </header>
    </div>
  );
}

export default App;
