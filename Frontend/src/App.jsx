import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ViewResult from './components/ViewResult';
import AdminLogin from './components/AdminLogin';
import UploadResult from './components/UploadResult';
import Home from './components/Home';
import Navbar from './components/Navbar';
import AdminResultView from './components/AdminResultView';
import Activities from './components/Activities';
import EditResult from './components/EditResult';

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
        <Route path="/activities" element={<Activities />} />
      
        <Route path="/admin/edit-result/:id" element={<EditResult />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;
