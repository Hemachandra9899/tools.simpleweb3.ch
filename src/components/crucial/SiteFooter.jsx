import React from 'react';

const Footer = () => {
  return (
    
    
    <footer className="bg-black text-[#fffcfc] text-center py-6 font-['Press_Start_2P'] text-xs">
   <div className='gap-y-10'>© {new Date().getFullYear()} SimpleWeb3. All rights reserved.</div> 
    <p className="text-white text-l text-center">
        Developed by <a href="https://etherscan.io/address/0x48a66CBeFa58CC0f1c2bDc6Fb7e9A4560Aa40eD0" target='_blank' className='text-blue-300'>simpleweb3.eth</a>
      </p>
  </footer>
  );
};

export default Footer;