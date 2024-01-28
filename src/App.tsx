import Home from "./pages/Home"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Usage from "./pages/Usage"
import Layout from "./components/Layout"
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="usage" element={<Usage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App