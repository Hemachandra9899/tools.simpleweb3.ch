import React from 'react';
import Header from '../components/crucial/SiteHeader';
import Footer from '../components/crucial/SiteFooter';
import { NavLink } from 'react-router-dom';
import RetroMenu from "../components/modals/RetroMenu"; 

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
         <header className="fixed top-0 left-0 w-full px-4 sm:px-8 md:px-16 py-4 flex justify-between items-center bg-black z-50">
  <NavLink to="/" className="flex items-center gap-2 cursor-pointer">
    <img className="h-10 w-auto flicker" src="/logo/mdi_cube-outline.svg" alt="SimpleWeb3 Logo" />
    <p className="font-[Jersey_10] text-[#fffcfc] text-base sm:text-lg md:text-xl tracking-wide leading-normal whitespace-nowrap">
      Simple<span className="text-[#c1ef00]">Web3</span>
    </p>
  </NavLink>

  {/* Mobile Menu Button */}
  <div className="sm:hidden">
    <button
      className="font-[Jersey_10] text-[#fffcfc] text-xl flicker"
      onClick={() => setShowMenu(true)}
    >
      <RetroMenu />
    </button>
  </div>

  {/* Desktop Menu (show only on sm and above) */}
  <div className="hidden sm:block">
    <button
      className="font-[Jersey_10] text-[#fffcfc] text-xl flicker cursor-pointer"
      onClick={() => setShowMenu(true)}
    >
      <RetroMenu />
    </button>
  </div>
</header>
      <div className="bg-black min-h-screen flex items-center justify-center px-6 py-20">
  <div className="max-w-4xl w-full space-y-10 text-left">
    
    {/* Main Heading */}
    <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wide">
      Welcome to <span className="text-[#c1ef00]">tools.simpleweb3</span>
    </h1>

    {/* Description */}
    <div className="space-y-6">
      <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
        Simplest EVM Transaction Submission is a lightweight, intuitive interface built for developers and power users
        to <span className="text-white font-semibold">test, simulate, and submit Ethereum transactions</span> with ease.
      </p>

      <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
        This tool breaks down the Ethereum transaction process into a clean, step-by-step flow — making it ideal for
        <span className="text-white font-medium"> dApp developers, auditors, and blockchain learners</span> who want
        full control and visibility into what they’re signing and sending.
      </p>
    </div>

  </div>
</div>

      <Footer />
    </div>
  );
};

export default About;
