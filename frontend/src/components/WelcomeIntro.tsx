import { useEffect, useState } from "react";
import { motion } from "motion/react";
import "./WelcomeIntro.css";

export default function WelcomeIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="welcome-intro"
      role="status"
      aria-label="Welcome to FixMate"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{
        duration: 2.4,
        times: [0, 0.82, 1],
        ease: "easeInOut",
      }}
    >
      <div className="welcome-intro__content">
        <motion.div
          className="welcome-intro__icon"
          initial={{ opacity: 0, scale: 0.6, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, type: "spring", stiffness: 180 }}
        >
          <svg viewBox="0 0 64 64" width="56" height="56" fill="none" aria-hidden="true">
            <path d="M8 29L32 9L56 29" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 26V53H49V26M27 53V37H37V53" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.p
          className="welcome-intro__eyebrow"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
        >
          WELCOME TO
        </motion.p>

        <motion.h1
          className="welcome-intro__name"
          initial={{ opacity: 0, scale: 0.72, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 150, damping: 12 }}
        >
          FIX<span>MATE</span>
        </motion.h1>

        <motion.p
          className="welcome-intro__tagline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.55 }}
        >
          Reliable help. Right at home.
        </motion.p>

        <motion.div
          className="welcome-intro__progress"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 1.55, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
