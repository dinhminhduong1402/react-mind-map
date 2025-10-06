import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50 to-orange-50 text-gray-800 z-50 overflow-hidden">
      {/* Central glowing orb */}
      <motion.div
        className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-purple-500 shadow-[0_0_40px_10px_rgba(168,85,247,0.3)]"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 25px 10px rgba(249,115,22,0.3)",
            "0 0 50px 15px rgba(168,85,247,0.4)",
            "0 0 25px 10px rgba(249,115,22,0.3)",
          ],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Expanding ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-orange-400"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </motion.div>

      {/* Orbiting nodes */}
      {[...Array(6)].map((_, i) => {
        const radius = 85;
        const angle = (i / 6) * 2 * Math.PI;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-purple-400 to-orange-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
            animate={{
              x: [x, x * 1.1, x],
              y: [y, y * 1.1, y],
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* App name */}
      <motion.h1
        className="mt-8 text-3xl font-bold tracking-wide text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1], y: [10, 0] }}
        transition={{ duration: 1.2 }}
      >
        <span className="text-orange-500">Free</span>
        <span className="text-purple-500">Mind Map</span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="mt-2 text-gray-500 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Connecting your ideas...
      </motion.p>

      {/* Background floating lines */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-gradient-to-r from-purple-300 to-orange-200"
          style={{
            top: `${30 + i * 15}%`,
            left: `${15 + i * 10}%`,
          }}
          animate={{
            width: ["0px", "50px", "0px"],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
