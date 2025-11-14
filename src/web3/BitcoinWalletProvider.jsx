// src/web3/BitcoinWalletProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
// ---- Add these helpers near the top of BitcoinWalletProvider.jsx ----
function tryRequest(p, method, params) {
  // Supports both p.request('method', params) and p.request({method, params})
  if (!p?.request) return Promise.resolve(null);
  return p.request({ method, params }).catch(() =>
    typeof p.request === 'function'
      ? p.request(method, params).catch(() => null)
      : null
  );
}

function extractAddressStruct(res) {
  // Handles: array of {address, purpose}, {addresses: [...]}, {accounts: [...]}, or strings
  if (!res) return { address: null, network: null };

  const pickAddr = (item) =>
    item?.address?.address || item?.address || item?.payment?.address || item;

  // Prefer 'payment' purpose if available
  const pickFromArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const pref = arr.find((x) => (x?.purpose || x?.type) === 'payment') || arr[0];
    return pickAddr(pref);
  };

  // Arrays
  if (Array.isArray(res)) {
    return { address: pickFromArray(res), network: res?.[0]?.network || null };
  }

  // Objects with arrays
  if (Array.isArray(res.addresses)) {
    return { address: pickFromArray(res.addresses), network: res?.network || res?.addresses?.[0]?.network || null };
  }
  if (Array.isArray(res.accounts)) {
    return { address: pickFromArray(res.accounts), network: res?.network || res?.accounts?.[0]?.network || null };
  }

  // Single object
  if (res.address) {
    return { address: pickAddr(res), network: res?.network || null };
  }

  return { address: null, network: res?.network || null };
}

function normalizeNet(n) {
  if (!n) return 'mainnet';
  return /test/i.test(n) ? 'testnet' : 'mainnet';
}

// ---- Replace your connectBws with this robust version ----
async function connectBws(p) {
  // 1) Ask user to approve connection (different wallets use different method names)
  await tryRequest(p, 'connect', { purposes: ['payment', 'ordinals'], message: 'Connect to SimpleWeb3' })
    || await tryRequest(p, 'wallet_connect', { purposes: ['payment', 'ordinals'], message: 'Connect to SimpleWeb3' })
    || null; // some wallets auto-approve or don’t need this

  // 2) Fetch addresses (try multiple shapes)
  let res =
    (await tryRequest(p, 'getAddresses', { purposes: ['payment', 'ordinals'] })) ||
    (await tryRequest(p, 'wallet_getAddresses', { purposes: ['payment', 'ordinals'] })) ||
    (await tryRequest(p, 'getAccounts')) ||
    (await tryRequest(p, 'wallet_getAccounts')) ||
    null;

  // 3) Parse returned structure
  const { address, network } = extractAddressStruct(res);

  if (!address) {
    // Give a helpful reason
    throw new Error(
      "Bitcoin wallet returned no address. Open your wallet, unlock it, approve the connection, " +
      "then try again. If you’re using Xverse/Leather, ensure site access is allowed and you’re not inside an iframe."
    );
  }

  const wallet =
    p?.name ||
    (window?.XverseProviders?.bitcoin ? 'Xverse' :
     window?.leather?.bitcoin       ? 'Leather' :
     window?.okxwallet?.bitcoin     ? 'OKX' :
     window?.xfi?.bitcoin           ? 'XDEFI' : 'Bitcoin Wallet');

  return { address, network: normalizeNet(network), wallet };
}

/* top-level connect removed — the provider contains the proper `connect` implementation */

/* ---------------- Detection helpers ---------------- */
function getBtcProvider() {
  if (typeof window === "undefined") return null;

  // Bitcoin Web Standard style (Xverse/Leather/OKX/XDEFI)
  const bws =
    (window.btc && typeof window.btc.request === "function" && window.btc) ||
    (window.leather?.bitcoin && typeof window.leather.bitcoin.request === "function" && window.leather.bitcoin) ||
    (window.XverseProviders?.bitcoin && typeof window.XverseProviders.bitcoin.request === "function" && window.XverseProviders.bitcoin) ||
    (window.okxwallet?.bitcoin && typeof window.okxwallet.bitcoin.request === "function" && window.okxwallet.bitcoin) ||
    (window.xfi?.bitcoin && typeof window.xfi.bitcoin.request === "function" && window.xfi.bitcoin);

  if (bws) return { type: "bws", p: bws };

  // Unisat style
  if (window.unisat && typeof window.unisat.requestAccounts === "function") {
    return { type: "unisat", p: window.unisat };
  }

  return null;
}

/* duplicate simple connectBws removed — using the robust `connectBws` defined earlier */

/* ---------------- Context ---------------- */
const BitcoinCtx = createContext(null);

export function BitcoinWalletProvider({ children }) {
  const [connected, setConnected]   = useState(false);
  const [address, setAddress]       = useState(null);
  const [network, setNetwork]       = useState(null);     // 'mainnet' | 'testnet'
  const [walletName, setWalletName] = useState(null);
  const [walletAvailable, setWalletAvailable] = useState(false);

  const providerRef = useRef(null);   // keep latest provider obj

  // Detect provider repeatedly (extensions can inject late)
  useEffect(() => {
    const check = () => {
      const found = getBtcProvider();
      providerRef.current = found?.p || null;
      setWalletAvailable(!!found);
    };
    check();
    const id = setInterval(check, 2000);
    window.addEventListener("focus", check);
    return () => { clearInterval(id); window.removeEventListener("focus", check); };
  }, []);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wallet.btc") || "null");
      if (saved?.address) {
        setConnected(!!saved.connected);
        setAddress(saved.address);
        setNetwork(saved.network || "mainnet");
        setWalletName(saved.wallet || null);
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("wallet.btc", JSON.stringify({
      connected, address, network, wallet: walletName,
    }));
  }, [connected, address, network, walletName]);

  // Subscribe to wallet events (if available)
  useEffect(() => {
    const p = providerRef.current;
    if (!p || typeof p.on !== "function") return;

    const onAccounts = (accs) => {
      const a = Array.isArray(accs) ? (accs[0]?.address || accs[0]) : null;
      if (a) { setConnected(true); setAddress(a); }
    };
    const onNetwork = (net) => {
      const n = typeof net === "string" ? net : (net?.network || net?.chain || "");
      setNetwork(/test/i.test(n) ? "testnet" : "mainnet");
    };

    // Unisat: 'accountsChanged', 'networkChanged'
    // BWS wallets sometimes also emit 'accountsChanged'/'networkChanged'
    try { p.on("accountsChanged", onAccounts); } catch {}
    try { p.on("networkChanged", onNetwork); } catch {}
    try { p.on("chainChanged", onNetwork); } catch {}

    return () => {
      try { p.removeListener?.("accountsChanged", onAccounts); } catch {}
      try { p.removeListener?.("networkChanged", onNetwork); } catch {}
      try { p.removeListener?.("chainChanged", onNetwork); } catch {}
    };
  }, [walletAvailable]); // re-evaluate when provider appears

  const connect = async () => {
    const found = getBtcProvider();
    providerRef.current = found?.p || null;

    if (!found) {
      throw new Error(
        "No Bitcoin wallet detected. Install Xverse/Leather/Unisat, allow this site in the extension settings, then refresh."
      );
    }
    const { type, p } = found;

    if (type === "bws") {
      const { address, network, wallet } = await connectBws(p);
      setConnected(true); setAddress(address); setNetwork(network); setWalletName(wallet);
    } else {
      // Unisat flow
      const accs = await p.requestAccounts();
      const addr = accs?.[0];
      const net = await p.getNetwork?.(); // 'livenet' | 'testnet'
      setConnected(true); setAddress(addr);
      setNetwork(net === "testnet" ? "testnet" : "mainnet");
      setWalletName("Unisat");
    }
  };

  const disconnect = () => {
    setConnected(false);
    setAddress(null);
    setNetwork(null);
    // keep walletName or clear it if you prefer
    localStorage.removeItem("wallet.btc");
  };

  const switchNetwork = async (target /* 'mainnet'|'testnet' */) => {
    const p = providerRef.current;
    // Unisat supports programmatic switch
    if (p?.switchChain && typeof p.switchChain === "function") {
      await p.switchChain(target === "testnet" ? "testnet" : "livenet");
      const net = await p.getNetwork?.();
      setNetwork(net === "testnet" ? "testnet" : "mainnet");
      return;
    }
    // Others: UX hint (switch in wallet UI). We still reflect desired state.
    setNetwork(target);
  };

  const value = useMemo(() => ({
    connected, address, network, walletName, walletAvailable,
    connect, disconnect, switchNetwork
  }), [connected, address, network, walletName, walletAvailable]);

  return (
    <BitcoinCtx.Provider value={value}>
      {children}
    </BitcoinCtx.Provider>
  );
}

export function useBitcoin() {
  const ctx = useContext(BitcoinCtx);
  if (!ctx) throw new Error("useBitcoin must be used inside <BitcoinWalletProvider>");
  return ctx;
}
