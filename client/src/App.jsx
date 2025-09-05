import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landingpage from "./pages/Landingpage"
const App = () => {
  return (
    <div>
      {/* <ToastContainer /> */}
      <Routes>
        <Route path="/" element={<Landingpage/> } />
      </Routes>
    </div>
  )
}

export default App
