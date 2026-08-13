import { BrowserRouter, Route, Routes } from "react-router-dom"
import Register from "./components/Register"
import Product from "./components/Product"

// function Login() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
//       <div className="w-full max-w-sm rounded-[3px] border border-stone-200 bg-white p-9 text-center shadow-[0_24px_48px_-32px_rgba(20,22,26,0.35)]">
//         <h1 className="font-serif text-2xl font-semibold text-stone-900">
//           Sign in
//         </h1>
//         <p className="mt-2 text-sm text-stone-500">
//           Login page goes here.
//         </p>
//       </div>
//     </div>
//   );
// }

// function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
//       <div className="text-center">
//         <h1 className="font-serif text-3xl font-semibold text-stone-900">
//           Home
//         </h1>
//         <p className="mt-2 text-sm text-stone-500">
//           Your app's main page goes here.
//         </p>
//       </div>
//     </div>
//   );
// }

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/Product" element={<Product />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
