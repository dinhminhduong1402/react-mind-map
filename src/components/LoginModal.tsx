import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button"
import { FcGoogle } from "react-icons/fc";
import { useCallback } from "react";
import { useToastStore } from "@/store/useToastStore";
import { AccessService } from "@/services/accessService";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: ProjectModalProps) {
  const {addToast} = useToastStore()
  
  const loginWithGoogleOAuth = useCallback(() => {
    AccessService.getGoogleOAuthLoginUrl()
    .then(url => {
      window.open(url, '_self')
    })
    .catch(err => {
      console.error(err)
      addToast('API error', 'error')
    })
  }, [])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white w-2/5 h-4/5 rounded-2xl shadow-xl flex flex-col"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b text-gray-500">
              <h2 className="text-lg flex gap-3">Login modal</h2>
              <button onClick={onClose}>
                <X
                  size={22}
                  className="text-gray-600 hover:text-black cursor-pointer"
                />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-y-auto p-6 space-y-4 justify-center items-center">
              <Button variant={"outline"} className="cursor-pointer" onClick={() => loginWithGoogleOAuth()}>
                <FcGoogle/>Login with Google</Button>
            </div>

            {/* Footer - Add Project */}
            <div className="px-6 py-4 border-t gap-2 flex justify-center">
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
