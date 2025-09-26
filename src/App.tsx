import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import LoginSuccess from '@/pages/LoginSuccess'

export default function App() {
  
  return (
     <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        
      </Routes>
    </BrowserRouter>
    
    
  );
}
