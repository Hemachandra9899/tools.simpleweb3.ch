// HeaderPixelRK_SolanaPill.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css"; // move to app root in prod
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import SolanaConnectButton from "../buttons/SolanaConnectButton.jsx";

/* ========================= Pixel primitives ========================= */
const PixelShell = ({ children, className = "" }) => (
  <div
    className={`relative bg-white border-[4px] border-black p-3 shadow-[4px_4px_0_0_black] ${className}`}
    style={{ imageRendering: "pixelated" }}
  >
    <div className="absolute top-0 left-0 w-2 h-2 bg-black" />
    <div className="absolute top-0 right-0 w-2 h-2 bg-black" />
    <div className="absolute bottom-0 left-0 w-2 h-2 bg-black" />
    <div className="absolute bottom-0 right-0 w-2 h-2 bg-black" />
    {children}
  </div>
);

const pixelBtnBase =
  "inline-flex items-center justify-center rounded-none border-2 border-black shadow-[4px_4px_0_0_#fffcfc] text-[11px] leading-none font-['Press_Start_2P'] px-6 py-3 transition-all duration-75 ease-in";
const pixelBtnActive =
  "bg-[#00FE77] hover:bg-[#c1ef00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc]";
function PixelButton({ onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${pixelBtnBase} ${pixelBtnActive} ${className}`}
      style={{ imageRendering: "pixelated" }}
    >
      {children}
    </button>
  );
}

/* ========================= Animations ========================= */
const drawerVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 26 } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.15 } },
};
const modalVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98, rotate: -1.5 },
  show: {
    opacity: 1, y: 0, scale: 1, rotate: 0,
    transition: { type: "spring", stiffness: 320, damping: 24 },
  },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } },
};

/* ========================= Helpers ========================= */
const CHAIN_NAME = { 1: "Ethereum", 137: "Polygon", 8453: "Base", 56: "BSC", 11155111: "Sepolia" };
const shortAddr = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
const solShort = (pk) => (pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : "");

function solClusterFromEndpoint(endpoint) {
  const e = (endpoint || "").toLowerCase();
  if (e.includes("mainnet")) return "Mainnet";
  if (e.includes("devnet")) return "Devnet";
  if (e.includes("testnet")) return "Testnet";
  if (e.includes("localhost") || e.includes("127.0.0.1")) return "Localnet";
  return "Custom";
}

/* ========================= Solana Pill ========================= */
function PixelSolanaPill() {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const { connection } = useConnection();

  if (!connected || !publicKey) return null;

  const addr = publicKey.toBase58();
  const cluster = solClusterFromEndpoint(connection?.rpcEndpoint);
  const icon = wallet?.adapter?.icon; // data URL or URL
  const name = wallet?.adapter?.name || "Solana";

  return (
    <div
      className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0_#000] text-[10px] font-['Press_Start_2P']"
      style={{ imageRendering: "pixelated" }}
      title={`${name} · ${cluster} · ${addr}`}
    >
      {icon ? (
        <img
          src={icon}
          alt={`${name} logo`}
          className="h-3 w-3"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <span className="inline-block h-3 w-3 bg-black" />
      )}
      <span className="text-black">{cluster} · {solShort(addr)}</span>
      <button
        onClick={() => disconnect()}
        className="ml-2 px-2 py-1 border-2 border-black bg-black text-white hover:bg-[#ff2edd]"
        title="Disconnect Solana"
      >
        X
      </button>
    </div>
  );
}

/* ========================= Wallet Modal (Pixel) ========================= */
function EvmConnectTrigger({ onBeforeOpen }) {
  const { openConnectModal } = useConnectModal();
  const handle = () => {
    try { onBeforeOpen?.(); } catch {}
    setTimeout(() => openConnectModal?.(), 80); // let our modal close
  };
  return <PixelButton onClick={handle}>Connect EVM Wallet</PixelButton>;
}

function PixelWalletModal({ open, onClose }) {
  const { isConnected: evmConnected } = useAccount();
  const { connected: solConnected } = useWallet();
  const [tab, setTab] = useState("EVM");
  const panelRef = useRef(null);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, onClose]);

  // Auto-close when either connects
  useEffect(() => {
    if (open && (evmConnected || solConnected)) onClose();
  }, [open, evmConnected, solConnected, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-[61] grid place-items-center px-4"
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div ref={panelRef} className="w-full max-w-[520px]">
              <PixelShell>
                {/* Title + Close */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-['Press_Start_2P']">Select Wallet Type</div>
                  <button
                    onClick={onClose}
                    className="px-2 py-1 border-2 border-black bg-black text-white text-[10px] font-['Press_Start_2P']"
                  >
                    CLOSE
                  </button>
                </div>

                {/* Tabs */}
                <div className="mt-3 inline-flex border-2 border-black">
                  {["EVM", "Solana"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-3 py-2 text-[10px] font-['Press_Start_2P'] border-r-2 border-black last:border-r-0 ${
                        tab === t ? "bg-[#00FE77]" : "bg-white hover:bg-[#c1ef00]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="mt-4 space-y-3">
                  {tab === "EVM" ? (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">
                        Connect with RainbowKit-supported wallets
                      </div>
                      <EvmConnectTrigger onBeforeOpen={onClose} />
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
                        Chain switcher & wallet list appear in the RK modal.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">
                        Phantom, Solflare, Backpack & more
                      </div>
                      <div>
                        <SolanaConnectButton />
                      </div>
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
                        Cluster follows your ConnectionProvider (mainnet/devnet).
                      </div>
                    </>
                  )}
                </div>
              </PixelShell>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ========================= Header ========================= */
export default function HeaderPixelRK_SolanaPill() {
  const { isConnected: evmConnected } = useAccount();
  const { connected: solConnected } = useWallet();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const menuItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/transaction", label: "Send Transaction", icon: "💸" },
    { path: "/converter", label: "Converter", icon: "🔄" },
    { path: "/sign", label: "Sign Message", icon: "✍️" },
    { path: "/verify", label: "Verify", icon: "✅", comingSoon: true },
    { path: "/read", label: "Read Data", icon: "📖", comingSoon: true },
    { path: "/about", label: "About", icon: "ℹ️" },
  ];

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* neon hairline */}
      <div className="fixed top-0 left-0 w-full bg-black  " />
      <header className="fixed top-[0px] left-0 w-full z-[46] bg-black border-b border-white">
        <div className="px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between">
          {/* Logo + Company name */}
          <NavLink to="/" className="group flex items-center gap-2 cursor-pointer">
            <img
              className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105"
              src="/logo/mdi_cube-outline.svg"
              alt="SimpleWeb3 Logo"
            />
            <p className="hidden sm:block font-[Jersey_10] text-white text-lg md:text-xl tracking-wide">
              Simple<span className="text-[#00FE77]">Web3</span>
            </p>
          </NavLink>

          {/* Right side: Connect + 3-lines menu */}
          <div className="flex items-center gap-3">
            {/* EVM pill (w/ chain logo + network switch) */}
            {evmConnected && (
              <div className="hidden sm:block">
                <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
              </div>
            )}

            {/* Solana pill (wallet logo + cluster + short addr) */}
            {solConnected && <PixelSolanaPill />}

            {/* If neither connected: show pixel connect */}
            {!evmConnected && !solConnected && (
              <PixelButton onClick={() => setIsWalletModalOpen(true)}>Connect Wallet</PixelButton>
            )}

            {/* 3-lines burger menu (unchanged) */}
            <button
              onClick={toggleMenu}
              className="relative p-2 rounded-lg border border-white/20 text-white/90 hover:text-[#00FE77] hover:border-[#00FE77]/60 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="block w-5 h-[2px] bg-current" />
                <span className="block w-5 h-[2px] bg-current" />
                <span className="block w-5 h-[2px] bg-current" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MENU Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              aria-label="Close menu overlay"
            />
            <motion.nav
              className="fixed top-[66px] right-4 sm:right-8 md:right-16 w-80 bg-[#0a0a0a]/95 border border-white/20 rounded-2xl z-50 shadow-2xl"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
                <h3 className="font-['Press_Start_2P'] text-white text-[11px]">Navigation</h3>
                <button
                  onClick={closeMenu}
                  className="text-white/80 hover:text-[#00FE77] font-['Press_Start_2P'] text-[10px]"
                >
                  ✕ CLOSE
                </button>
              </div>

              <ul className="p-2 max-h-[60vh] overflow-auto">
                {menuItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="relative"
                  >
                    {item.comingSoon ? (
                      <div className="relative">
                        <div className="flex items-center gap-3 p-3 text-white/40 cursor-not-allowed">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-['Press_Start_2P'] text-[11px]">{item.label}</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#FF2EDD] text-black px-1 py-0.5 text-[9px] font-['Press_Start_2P'] rotate-6 rounded">
                          SOON
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 ${
                            isActive
                              ? "bg-[#00FE77]/15 text-[#00FE77]"
                              : "text-white hover:text-[#00FE77]"
                          }`
                        }
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-['Press_Start_2P'] text-[11px]">{item.label}</span>
                      </NavLink>
                    )}
                  </motion.li>
                ))}
              </ul>

              <div className="px-4 py-3 border-t border-white/15">
                <p className="text-white/60 font-['Press_Start_2P'] text-[10px] text-center">
                  SimpleWeb3 Tools v1.0
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Pixel Wallet Modal */}
      <PixelWalletModal open={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />

      {/* Spacer for fixed header */}
      <div className="h-[66px]" />
    </>
  );
}
