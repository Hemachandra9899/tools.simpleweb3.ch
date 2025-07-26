import { motion } from "framer-motion";

/* ───────── Base Card + CardContent (same as LandingPage) ───────── */
export const Card = ({ className = "", children }) => (
  <div className={`bg-white border-4 border-black p-2 shadow-[4px_4px_0_0_black] ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ className = "", children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

/* ───────── “COMING SOON” sticker (reuse if needed) ───────── */
export const ComingSoonSticker = () => (
  <div
    className="
      absolute -top-4 -left-4 z-20
      bg-[#FF2EDD] text-black
      border-2 border-black
      px-2 py-1 text-[9px] leading-[10px] font-['Press_Start_2P']
      rotate-[-12deg]
      shadow-[3px_3px_0_0_#000]
    "
    style={{ imageRendering: "pixelated" }}
  >
    COMING<br />SOON
  </div>
);

/* ───────── Roll-in variants (exactly what you used) ───────── */
export const rollVariants = {
  hidden: (i) => ({
    opacity: 0,
    x: i % 2 === 0 ? -140 : 140,
    rotate: i % 2 === 0 ? -45 : 45,
    scale: 0.8,
  }),
  show: (i) => ({
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 22,
      delay: i * 0.08,
    },
  }),
  hover: {
    y: -6,
    rotate: -2,
    transition: { type: "spring", stiffness: 260, damping: 16 },
    filter: "drop-shadow(4px_4px_0_#00FE77)",
  },
  tap: {
    y: 0,
    rotate: 0,
    scale: 0.97,
    filter: "drop-shadow(2px_2px_0_#00FE77)",
    transition: { duration: 0.06 },
  },
};

/* ───────── Wrapper that applies variants ───────── */
export const AnimatedCard = ({ i = 0, comingSoon = false, children }) => (
  <motion.div
    custom={i}
    variants={rollVariants}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.3 }}
    whileHover="hover"
    whileTap="tap"
    className="relative"
    style={{ imageRendering: "pixelated" }}
  >
    {comingSoon && <ComingSoonSticker />}
    {children}
  </motion.div>
);
