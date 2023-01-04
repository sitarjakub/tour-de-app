import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './css/index.css';

import Home from './components/Home';
import Login from './components/Login';
import { AuthProvider, useUser } from './context/AuthContext';

function App() {
  function RequireAuth({children}:{children:JSX.Element}):JSX.Element {
    const {user} = useUser();
    return user ? children : <Navigate to="/login"/>;
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<RequireAuth><Home /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
