"use client";

import { Toaster, toast } from "react-hot-toast";
import { createContext, useContext } from "react";

// Context hook
const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

// Provider
export const ToastProvider = ({ children }) => {
  const showToast = (msg, type = "success") => {
    if (type === "success") toast.success(msg);
    else if (type === "error") toast.error(msg);
    else toast(msg);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toaster position="top-right" />
      {children}
    </ToastContext.Provider>
  );
};
