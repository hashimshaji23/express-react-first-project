import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google"; 

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="346107629648-0qnbt3vkulfmusluse6mvpu2mc1np375.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
)
