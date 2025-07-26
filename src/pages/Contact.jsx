import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaGithub, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import RetroMenu from "../components/modals/RetroMenu";

const ContactSection = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", { email, message });
    setEmail("");
    setMessage("");
  };

  return (
    <div className="bg-black min-h-screen font-['Press_Start_2P'] text-white">
      {/* Fixed Retro Header */}
      <header className="fixed top-0 left-0 w-full px-4 sm:px-8 md:px-16 py-4 flex justify-between items-center bg-black z-50">
        <NavLink to="/" className="flex items-center gap-2 cursor-pointer">
          <img
            className="h-10 w-auto flicker"
            src="/logo/mdi_cube-outline.svg"
            alt="SimpleWeb3 Logo"
          />
          <p className="font-[Jersey_10] text-[#fffcfc] text-base sm:text-lg md:text-xl tracking-wide leading-normal whitespace-nowrap">
            Simple<span className="text-[#c1ef00]">Web3</span>
          </p>
        </NavLink>

        {/* Retro Menu */}
        <div className="sm:hidden">
          <button className="text-[#fffcfc] text-xl flicker">
            <RetroMenu />
          </button>
        </div>
        <div className="hidden sm:block">
          <button className="text-[#fffcfc] text-xl flicker cursor-pointer">
            <RetroMenu />
          </button>
        </div>
      </header>

      {/* Main Contact Section */}
      <section className="pt-32 px-4 pb-20"> {/* pt-32 pushes content below header */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#ffffff] text-xl md:text-2xl mb-4">
            _ LET’S CONNECT
          </h2>
          <p className="text-gray-300 text-[10px] md:text-xs mb-12">
            Fill in the form or hit the icons to reach out
          </p>

          {/* Form */}
          <form
  onSubmit={handleSubmit}
  className="bg-[#111] border-2 border-[#ffffff] p-6 space-y-6 relative shadow-[6px_6px_0_0_#00FF00] rounded-none"
>
  <div className="relative">
    <input
      type="email"
      required
      placeholder="you@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full bg-black text-[#ffffff] font-mono border-2 border-[#ffffff] px-4 py-2 text-xs outline-none placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-[#00FF00] focus:shadow-[4px_4px_0_0_#00FF00] transition-all duration-75"
    />
  </div>

  <div className="relative">
    <textarea
      required
      placeholder="Type your 8-bit message..."
      rows={4}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className="w-full bg-black text-[#ffffff] font-mono border-2 border-[#ffffff] px-4 py-2 text-xs outline-none placeholder-gray-500 focus:outline-none focus:border-[#00FF00] focus:shadow-[4px_4px_0_0_#00FF00] transition-all duration-75 resize-none"
    ></textarea>
  </div>

  <button
    type="submit"
    className="bg-[#ffffff] text-black px-6 py-2 text-xs font-bold border-2 border-black shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] transition-all duration-75 uppercase"
  >
    SEND
  </button>
</form>
          {/* Contact Icons */}
          <div className="flex justify-center mt-10 space-x-6 text-[#ffffff] text-lg">
            <a
              href="mailto:pottingari@gmail.com"
              className="hover:text-green-300 transition"
            >
              <FaEnvelope />
            </a>
            <a href="tel:+916305984164" className="hover:text-green-300 transition">
              <FaPhoneAlt />
            </a>
            <a
              href="https://github.com/tejareddy8888"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-300 transition"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactSection;
