import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room'

import { RoomProvider } from './context/RoomContext';
import './App.css'

function App() {
  return (
    <>
      <RoomProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </RoomProvider>
    </>
  )
}

export default App
