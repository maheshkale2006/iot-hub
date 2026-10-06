import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Projects from "./pages/Projects";
import ProductDetails from "./pages/ProductDetails";
import ProjectDetails from "./pages/ProjectDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= HOME ================= */}
        <Route path="/" element={<Home />} />

        {/* ================= SHOP ================= */}
        <Route path="/shop" element={<Shop />} />

        {/* ================= PRODUCT DETAILS ================= */}
        <Route
          path="/products/:id"
          element={<ProductDetails />}
        />

        {/* ================= PROJECTS ================= */}
        <Route
          path="/iot-projects"
          element={<Projects />}
        />

        {/* ================= PROJECT DETAILS ================= */}
        <Route
          path="/iot-projects/:id"
          element={<ProjectDetails />}
        />

        {/* ================= OLD PROJECT URL ================= */}
        <Route
          path="/projects"
          element={
            <Navigate
              to="/iot-projects"
              replace
            />
          }
        />

        {/* ================= OLD PROJECT DETAILS URL ================= */}
        <Route
          path="/projects/:id"
          element={<ProjectDetails />}
        />

        {/* ================= CONTACT ================= */}
        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* ================= AUTH ================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ================= CART ================= */}
        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* ================= DASHBOARD ================= */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
          <Route
          path="/Checkout"
          element={<Checkout/>}
        />

        {/* ================= FALLBACK ================= */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;