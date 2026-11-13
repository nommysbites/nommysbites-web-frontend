import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If navigation targets an in-page hash anchor (e.g., #outlet or #events)
    if (hash) {
      const targetId = hash.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Disable browser's automatic jumpy scroll restoration so smooth scroll takes effect
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Automatically smooth scroll to top of window on new page entry
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname, hash]);

  return null;
}

