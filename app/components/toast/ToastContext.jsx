"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });

        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {toast && (
                <div
                    className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999]
                    px-5 py-3 rounded-xl shadow-lg text-white font-medium
                    transition-all duration-300
                    ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
                >
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
