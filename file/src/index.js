import React from "react";
import ReactDOM from "react-dom/client";
import "react-quill/dist/quill.snow.css";
import "jsvectormap/dist/css/jsvectormap.css";
import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  </>
);

reportWebVitals();
