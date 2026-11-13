import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./FloatingWhatsApp.css";

const WHATSAPP_URL = `https://wa.me/2348105384162?text=${encodeURIComponent(
  "Hello Nommy's Bites, I would like to make an inquiry."
)}`;

export default function FloatingWhatsApp() {
  const { totalItemsCount, totalGiftBoxCount } = useCart();
  const location = useLocation();

  const barHiddenPaths = ["/bag", "/checkout", "/giftbox", "/giftbox/checkout"];
  const isGiftCatalog =
    location.pathname === "/gift" || location.pathname.startsWith("/gift/");
  const activeCount = isGiftCatalog ? totalGiftBoxCount : totalItemsCount;

  const hasFloatingBar =
    !barHiddenPaths.includes(location.pathname) && activeCount > 0;

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`floating-whatsapp-btn ${hasFloatingBar ? "with-floating-bar" : ""}`}
      aria-label="Chat with Nommy's Bites on WhatsApp"
      title="Chat on WhatsApp"
    >
      <svg
        viewBox="0 0 24 24"
        width="26"
        height="26"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.47 0 .1 5.37.1 11.96c0 2.11.55 4.17 1.6 5.98L0 24l6.23-1.63a11.94 11.94 0 0 0 5.83 1.49h.01c6.59 0 11.95-5.37 11.95-11.96 0-3.19-1.24-6.19-3.5-8.42ZM12.06 21.84h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.7.97.99-3.61-.24-.37a9.89 9.89 0 0 1-1.52-5.27c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.9 7c0 5.46-4.44 9.9-9.91 9.9Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}
