import { Route, Routes } from "react-router-dom"
import Register from "./components/Register"
import Product from "./components/Product"
import AdminOrderDashboard from "./components/AdminOrdersDashboard"
import LoginForm from "./components/LoginForm"
import Cart from "./components/Cart"
import Checkout from "./components/Checkout"
import MyOrders from "./components/Orders"
import OrderSuccess from "./components/OrderSuccess"
import ProductManagement from "./components/ProductManagement"
import AdminDashboard from "./components/AdminDashboard"


function App() {

  return (
    <>
      {/* <BrowserRouter> */}
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/Product" element={<Product />} />
          {/* <Route path="/adminDash" element={<AdminOrderDashboard/>} /> */}
          <Route path="/Tocart" element={<Cart/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/Myorders" element={<MyOrders/>} />
          <Route path="/Order-success" element={<OrderSuccess/>} />
          {/* <Route path="/admin-dash" element={<ProductManagement/>}/> */}
          <Route path="/admin-main-dash" element={<AdminDashboard/>} />
        </Routes>
      {/* </BrowserRouter> */}
    </>
  )
}

export default App
