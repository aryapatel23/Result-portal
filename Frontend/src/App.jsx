import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ViewResult from './components/method2/ViewResult';
import AdminLogin from './components/method2/AdminLogin';
import UploadResult from './components/method2/UploadResult';
import Home from './components/method2/Home';
import Navbar from './components/method2/Navbar';
import AdminResultView from './components/method2/AdminResultView';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" reverseOrder={false} />
      <Navbar />
      <Routes>
        <Route path="/student/view" element={<ViewResult />} />
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/upload" element={<UploadResult />} />
        <Route path="/admin/results" element={<AdminResultView />} />
      

      </Routes>
    </BrowserRouter>
  );
}
export default App;
