import { Route, Routes } from "react-router-dom"
import Register from "./components/Register"
import Product from "./components/Product"
import AdminOrdersDashboard from "./components/AdminOrdersDashboard"
import LoginForm from "./components/LoginForm"


function App() {

  return (
    <>
      {/* <BrowserRouter> */}
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/Product" element={<Product />} />
          <Route path="/adminDash" element={<AdminOrdersDashboard/>} />
          {/* <Route path="/Addtocart" element={<AddToCart/>} /> */}
        </Routes>
      {/* </BrowserRouter> */}
    </>
  )
}

export default App
