import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink } from 'react-router-dom';
// import { ConnectBtn } from '../web3/web3.connect';
import { Button } from "pixel-retroui";

const Header = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

  return (
    <nav className='bg-blur-700  border-teel-800 p-5'>
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='flex h-12 items-center justify-between'>
          {/* Logo */}
          <div className='flex-shrink-0'>
          <header className="fixed top-0 left-0 w-full px-4 sm:px-8 md:px-16 py-4 flex justify-between items-center bg-black z-50">
          <NavLink to="/" className="flex items-center gap-0 sm:gap-2 cursor-pointer">
  <img
    className="h-10 w-auto flicker"
    src="/logo/mdi_cube-outline.svg"
    alt="SimpleWeb3 Logo"
  />
  {/* Show the name only ≥ sm */}
  <p className="hidden sm:block font-[Jersey_10] text-[#fffcfc] text-base sm:text-lg md:text-xl tracking-wide whitespace-nowrap">
    Simple<span className="text-[#00FE77]">Web3</span>
  </p>
</NavLink>

  {/* Mobile Menu Button */}
  <div className="sm:hidden">
  <button className="font-[Jersey_10] text-[#fffcfc]  cursor-pointer"><ConnectButton /></button>
  </div>

  {/* Desktop Menu (show only on sm and above) */}
  <div className="hidden sm:block">
  <button className="font-[Jersey_10] text-[#fffcfc]  cursor-pointer"><ConnectButton /></button>
  </div>
</header>

            
          </div>
          {/* <div className="fixed top-[64px] md:top-[72px] left-0 w-full z-40 bg-black border-b-2 border-white">
              <div className="px-4 sm:px-8 md:px-16 py-4 flex overflow-x-auto gap-4">
                {["Home", "Transaction Sending", "Sign In", "Verify", "Read"].map((label) => (
                  <Button
                    key={label}
                    bg="black"
                    textColor="white"
                    borderColor="white"
                    shadow="white"
                    padding="px-6 py-3"
                    className="pixel-button text-sm whitespace-nowrap"
                    
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div> */}
            


          {/* ConnectButton */}
          <div className='flex-shrink md:flex-shrink-0'>
         
            
          </div>
        </div>
      </div>
    </nav >
  );
};
export default Header;
