import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import Landingpage from "./pages/Landingpage"
import { ToastContainer } from "react-toastify"
import Profile from "./pages/Profile"

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/profile" element={<Profile/> } />
        <Route path="/" element={<Landingpage/> } />
        <Route path="/login" element={<Login/> } />
        <Route path="/reset-password" element={<ResetPassword/> } />
       
      </Routes>
    </div>
  )
}

export default App
