// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomProvider } from './context/RoomContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Room from './pages/Room';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoomProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/room/:id"
              element={
                <ProtectedRoute>
                  <Room />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </RoomProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;