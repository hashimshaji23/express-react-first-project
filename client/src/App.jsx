import {BrowserRouter, Route, Routes } from "react-router-dom"
import Register from "./components/Register"
import Product from "./components/Product"

function App() {

  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path="/" element={<Register/>}/>
      <Route path="/Product" element={<Product/>} />
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
