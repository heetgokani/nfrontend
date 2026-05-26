import React from "react";
import { createRoot } from "react-dom/client";

let toastContainer = null;
let root = null;
let timeout = null;

export const bntToast = {
  show: (content, typeStyles) => {
    // 1. Create the container if it doesn't exist
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      Object.assign(toastContainer.style, {
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999",
      });
      document.body.appendChild(toastContainer);
      root = createRoot(toastContainer);
    }

    // 2. Clear any existing timeout so it doesn't disappear too early if clicked twice
    if (timeout) {
      clearTimeout(timeout);
    }

    // 3. Render the new toast (this instantly replaces the old one, preventing stacking)
    root.render(
      <div
        style={{
          ...typeStyles.style,
          animation: "bnt-fade-in 0.2s ease-out",
        }}
      >
        {content}
      </div>,
    );

    // 4. Auto-remove after 2 seconds
    timeout = setTimeout(() => {
      root.render(null);
    }, 2000);
  },

  // Map the methods to match your existing react-toastify syntax
  success: (content, options) => bntToast.show(content, options),
  info: (content, options) => bntToast.show(content, options),
  error: (content, options) => bntToast.show(content, options),
};

// Inject the fade-in animation CSS
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes bnt-fade-in {
      from { opacity: 0; transform: translateY(-15px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}
