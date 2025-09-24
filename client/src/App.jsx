import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Login from "./pages/Login"
import ResetPassword from "./pages/ResetPassword"
import Landingpage from "./pages/Landingpage"
import { ToastContainer } from "react-toastify"
import Profile from "./pages/Profile"
import ChatbotPage from "./pages/Chatbot"
import MatchesPage from "./pages/Matches"
import Messages from "./pages/Messages"

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/chat-bot" element={<ChatbotPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Messages />} />
        <Route path="/profile/:id" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App
