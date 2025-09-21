import { X, Link, HeartPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import qrCodeImagePath from "@/assets/bmc_qr.png";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonateModal({ isOpen, onClose }: ProjectModalProps) {
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
              <h2 className="text-lg flex gap-3"><HeartPlus/> Wishing you a great experience here! </h2>
              <button onClick={onClose}>
                <X
                  size={22}
                  className="text-gray-600 hover:text-black cursor-pointer"
                />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-y-auto p-6 space-y-4 justify-center">
              <img
                className=""
                src={qrCodeImagePath}
                alt="donate_qrcode"
                height={400}
                style={{ objectFit: "contain", height: "350px" }}
              />
            </div>

            {/* Footer - Add Project */}
            <div className="px-6 py-4 border-t gap-2 flex justify-center">
              <a
                href="https://buymeacoffee.com/dmdofficiaa"
                className="cursor-pointer w-100 flex justify-center gap-2 text-blue-500"
                target="blank"
              >
                <Link ></Link>
                Donate to me
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
