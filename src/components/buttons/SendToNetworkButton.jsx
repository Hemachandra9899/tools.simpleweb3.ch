import React from 'react';

const SendToNetworkButton = ({ isValid, onClick }) => {
    return (
        <div className="max-w-md mx-auto">
           <button
    type="button"
    onClick={onClick}
    className={`w-full py-2 px-4 border border-black shadow-[4px_4px_0_#fffcfc] text-sm font-medium text-black font-['Press_Start_2P'] transition-all duration-75 ease-in 
        ${isValid
            ? 'bg-[#d1ff03] hover:bg-[#c1ef00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#fffcfc]'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
    disabled={!isValid}
>
    Send to Network
</button>

        </div>
    );
};

export default SendToNetworkButton;