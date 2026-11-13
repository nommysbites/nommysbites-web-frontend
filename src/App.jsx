import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Gift from "./pages/Gift";
import PackageDetail from "./pages/PackageDetail";
import Contact from "./pages/Contact";
import CustomPackage from "./pages/CustomPackage";
import Bag from "./pages/Bag";
import GiftBox from "./pages/GiftBox";
import Checkout from "./pages/Checkout";
import GiftCheckout from "./pages/GiftCheckout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CheckoutInfo from "./pages/Account/CheckoutInfo";
import Orders from "./pages/Account/Orders";
import OrderDetail from "./pages/Account/OrderDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="menu/:id" element={<PackageDetail mode="menu" />} />
              <Route path="gift" element={<Gift />} />
              <Route path="gift/:id" element={<PackageDetail mode="gift" />} />
              <Route path="custom-package" element={<CustomPackage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="bag" element={<Bag />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="giftbox" element={<GiftBox />} />
              <Route path="giftbox/checkout" element={<GiftCheckout />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="account" element={<Navigate to="/account/checkout-info" replace />} />
              <Route path="account/checkout-info" element={<CheckoutInfo />} />
              <Route path="account/orders" element={<Orders />} />
              <Route path="account/orders/:orderId" element={<OrderDetail />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
