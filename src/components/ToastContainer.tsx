import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToastStore } from "@/store/useToastStore";
import { CheckCircle, XCircle, AlertTriangle, Loader } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const icons: Record<string, ReactNode > = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-yellow-500" size={20} />,
    process: <Loader className="animate-spin text-blue-500" size={20} />,
  };

  const bgColors: Record<string, string> = {
    success: "bg-green-100",
    error: "bg-red-100",
    warning: "bg-yellow-100",
    process: "bg-blue-100",
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.2 }}
            className={`${bgColors[toast.type]} flex items-center gap-2 px-4 py-2 rounded-2xl shadow-md`}
          >
            {icons[toast.type]}
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto text-gray-500 hover:text-black"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
