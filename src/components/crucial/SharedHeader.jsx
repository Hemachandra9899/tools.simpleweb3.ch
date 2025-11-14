// src/components/header/HeaderPixelRK_ThreeChains.jsx
import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import SolanaConnectButton from "../buttons/SolanaConnectButton.jsx";
import { useBitcoin } from "../../web3/BitcoinWalletProvider";

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
function PixelButton({ onClick, children, className = "", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${pixelBtnBase} ${pixelBtnActive} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
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
  show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: "spring", stiffness: 320, damping: 24 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.15 } },
};

/* ========================= Solana helpers & pill ========================= */
const solShort = (pk) => (pk ? `${pk.slice(0, 4)}…${pk.slice(-4)}` : "");
function solClusterFromEndpoint(endpoint) {
  const e = (endpoint || "").toLowerCase();
  if (e.includes("mainnet")) return "Mainnet";
  if (e.includes("devnet")) return "Devnet";
  if (e.includes("testnet")) return "Testnet";
  if (e.includes("localhost") || e.includes("127.0.0.1")) return "Localnet";
  return "Custom";
}

function PixelSolanaPill() {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const { connection } = useConnection();
  if (!connected || !publicKey) return null;

  const addr = publicKey.toBase58();
  const cluster = solClusterFromEndpoint(connection?.rpcEndpoint);
  const icon = wallet?.adapter?.icon;
  const name = wallet?.adapter?.name || "Solana";

  return (
    <div
      className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0_#000] text-[10px] font-['Press_Start_2P']"
      style={{ imageRendering: "pixelated" }}
      title={`${name} · ${cluster} · ${addr}`}
    >
      {icon ? (
        <img src={icon} alt={`${name} logo`} className="h-3 w-3" style={{ imageRendering: "pixelated" }} />
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

/* ========================= Bitcoin UI ========================= */
const shortAddr = (a, L = 6, R = 4) => (a ? `${a.slice(0, L)}…${a.slice(-R)}` : "");

function PixelBitcoinPill() {
  const btc = useBitcoin();
  if (!btc.connected || !btc.address) return null;
  const logo = btc.walletName === "Unisat" ? "/logo/unisat.png" : "/logo/bitcoin.svg";
  const human = btc.network === "testnet" ? "Testnet" : "Mainnet";

  return (
    <div
      className="inline-flex items-center gap-2 border-2 border-black bg-white px-2.5 py-1.5 shadow-[3px_3px_0_#000] text-[10px] font-['Press_Start_2P']"
      style={{ imageRendering: "pixelated" }}
      title={`Bitcoin (${btc.walletName || "Wallet"}) · ${human} · ${btc.address}`}
    >
      <img src={logo} alt="BTC" className="h-3 w-3" style={{ imageRendering: "pixelated" }} />
      <span className="text-black truncate">{human} · {shortAddr(btc.address, 5, 4)}</span>

      <select
        className="ml-1 px-1 py-0.5 border-2 border-black bg-white text-[10px]"
        value={btc.network || "mainnet"}
        onChange={(e) => btc.switchNetwork(e.target.value)}
        title="Change Bitcoin Network"
      >
        <option value="mainnet">Mainnet</option>
        <option value="testnet">Testnet</option>
      </select>

      <button
        onClick={btc.disconnect}
        className="ml-1 px-2 py-0.5 border-2 border-black bg-black text-white hover:bg-[#ff2edd]"
        title="Disconnect Bitcoin"
      >
        X
      </button>
    </div>
  );
}

function BitcoinConnectButton({ onBeforeOpen }) {
  const btc = useBitcoin();
  const handle = async () => {
    try { onBeforeOpen?.(); } catch {}
    try { await btc.connect(); } catch (e) { alert(e?.message || "Bitcoin wallet not found"); }
  };
  return <PixelButton onClick={handle}>Connect Bitcoin Wallet</PixelButton>;
}

/* ========================= Wallet Modal ========================= */
function EvmConnectTrigger({ onBeforeOpen }) {
  const { openConnectModal } = useConnectModal();
  const handle = () => {
    try { onBeforeOpen?.(); } catch {}
    setTimeout(() => openConnectModal?.(), 80);
  };
  return <PixelButton onClick={handle}>Connect EVM Wallet</PixelButton>;
}

function PixelWalletModal({ open, onClose }) {
  const { isConnected: evmConnected } = useAccount();
  const { connected: solConnected } = useWallet();
  const btc = useBitcoin();
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

  // Auto-close when any chain connects (shared context means header updates too)
  useEffect(() => {
    if (open && (evmConnected || solConnected || btc.connected)) onClose();
  }, [open, evmConnected, solConnected, btc.connected, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[60] bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="fixed inset-0 z-[61] grid place-items-center px-4" variants={modalVariants} initial="hidden" animate="show" exit="exit">
            <div ref={panelRef} className="w-full max-w-[560px]">
              <PixelShell>
                {/* Title + Close */}
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-['Press_Start_2P']">Select Wallet Type</div>
                  <button onClick={onClose} className="px-2 py-1 border-2 border-black bg-black text-white text-[10px] font-['Press_Start_2P']">CLOSE</button>
                </div>

                {/* Tabs */}
                <div className="mt-3 inline-flex border-2 border-black">
                  {["EVM", "Solana", "Bitcoin"].map((t) => (
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
                  {tab === "EVM" && (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">Connect with RainbowKit-supported wallets</div>
                      <EvmConnectTrigger onBeforeOpen={onClose} />
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">Chain switcher & wallet list appear in the RK modal.</div>
                    </>
                  )}

                  {tab === "Solana" && (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">Phantom, Solflare, Backpack & more</div>
                      <div><SolanaConnectButton /></div>
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">Cluster follows your app’s ConnectionProvider.</div>
                    </>
                  )}

                  {tab === "Bitcoin" && (
                    <>
                      <div className="text-[10px] font-['Press_Start_2P']">Xverse / Leather / OKX / XDEFI / Unisat</div>
                      <BitcoinConnectButton onBeforeOpen={onClose} />
                      {/* Optional hint if no wallet injected */}
                      {!btc.walletAvailable && (
                        <div className="text-[9px] text-red-600 font-['Press_Start_2P']">
                          No Bitcoin wallet detected. Install
                          {" "}<a className="underline" href="https://www.xverse.app" target="_blank" rel="noreferrer">Xverse</a>,{" "}
                          <a className="underline" href="https://leather.io" target="_blank" rel="noreferrer">Leather</a>,{" "}
                          <a className="underline" href="https://unisat.io" target="_blank" rel="noreferrer">Unisat</a>, then allow site access & refresh.
                        </div>
                      )}
                      <div className="text-[9px] text-black/70 font-['Press_Start_2P']">
                        Unisat supports in-app network switching. Others may require switching inside the wallet UI.
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
export default function HeaderPixelRK_ThreeChains() {
  const { isConnected: evmConnected } = useAccount();
  const { connected: solConnected } = useWallet();
  const btc = useBitcoin();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* top hairline */}
      <div className="fixed top-0 left-0 w-full bg-black" />
      <header className="fixed top-[0px] left-0 w-full z-[46] bg-black border-b border-white">
        <div className="px-4 sm:px-8 md:px-16 py-3 flex items-center justify-between">
          {/* Logo + Company name */}
          <NavLink to="/" className="group flex items-center gap-2 cursor-pointer">
            <img className="h-8 sm:h-9 w-auto transition-transform group-hover:scale-105" src="/logo/mdi_cube-outline.svg" alt="SimpleWeb3 Logo" />
            <p className="hidden sm:block font-[Jersey_10] text-white text-lg md:text-xl tracking-wide">
              Simple<span className="text-[#00FE77]">Web3</span>
            </p>
          </NavLink>

          {/* Right side: wallet status (mobile-visible) + burger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* EVM pill (RainbowKit)—visible on all screens */}
            {evmConnected && (
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
            )}

            {/* Solana pill */}
            {solConnected && <PixelSolanaPill />}

            {/* Bitcoin pill */}
            {btc.connected && <PixelBitcoinPill />}

            {/* If none connected → open modal */}
            {!evmConnected && !solConnected && !btc.connected && (
              <PixelButton onClick={() => setIsWalletModalOpen(true)}>Connect Wallet</PixelButton>
            )}

            {/* 3-lines burger menu */}
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
              className="fixed top-[66px] right-4 sm:right-8 md:right-16 w-[90vw] sm:w-80 bg-[#0a0a0a]/95 border border-white/20 rounded-2xl z-50 shadow-2xl"
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
                <h3 className="font-['Press_Start_2P'] text-white text-[11px]">Navigation</h3>
                <button onClick={closeMenu} className="text-white/80 hover:text-[#00FE77] font-['Press_Start_2P'] text-[10px]">✕ CLOSE</button>
              </div>

              {/* Wallet status inside drawer (extra visible on small screens) */}
              <div className="px-4 py-3 border-b border-white/15 flex flex-wrap gap-2 items-center">
                <span className="text-white/70 text-[10px] font-['Press_Start_2P']">Wallets:</span>
                {evmConnected && <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />}
                {solConnected && <PixelSolanaPill />}
                {btc.connected && <PixelBitcoinPill />}
                {!evmConnected && !solConnected && !btc.connected && (
                  <PixelButton
                    onClick={() => {
                      setIsWalletModalOpen(true);
                      closeMenu();
                    }}
                  >
                    Connect Wallet
                  </PixelButton>
                )}
              </div>

              <ul className="p-2 max-h-[56vh] overflow-auto">
                {[
                  { path: "/", label: "Home", icon: "🏠" },
                  { path: "/transaction", label: "Send Transaction", icon: "💸" },
                  { path: "/converter", label: "Converter", icon: "🔄" },
                  { path: "/sign", label: "Sign Message", icon: "✍️" },
                  { path: "/verify", label: "Verify", icon: "✅", comingSoon: true },
                  { path: "/read", label: "Read Data", icon: "📖", comingSoon: true },
                  { path: "/about", label: "About", icon: "ℹ️" },
                ].map((item, index) => (
                  <motion.li key={item.path} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} className="relative">
                    {item.comingSoon ? (
                      <div className="relative">
                        <div className="flex items-center gap-3 p-3 text-white/40 cursor-not-allowed">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-['Press_Start_2P'] text-[11px]">{item.label}</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-[#FF2EDD] text-black px-1 py-0.5 text-[9px] font-['Press_Start_2P'] rotate-6 rounded">SOON</div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 ${
                            isActive ? "bg-[#00FE77]/15 text-[#00FE77]" : "text-white hover:text-[#00FE77]"
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
                <p className="text-white/60 font-['Press_Start_2P'] text-[10px] text-center">SimpleWeb3 Tools v1.0</p>
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
