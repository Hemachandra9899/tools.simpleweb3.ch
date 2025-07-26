import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { parseEther } from 'viem';
import { useSendTransaction, usePrepareTransactionRequest } from 'wagmi';

import ValidateButton from '../components/buttons/ValidateButton';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';
import OverrideButton from '../components/buttons/Override';
import { useTransaction } from '../context/TransactionContextCore';
import { CustomNetworkAlert } from '../components/custom/alert';
import RetroSendingPopup from '../components/components/widgets/RetroSendingPopup.jsx';

const TransactionDetailsInput = lazy(() => import('../components/modals/TransactionDetails'));
const GasDetailsOutput       = lazy(() => import('../components/modals/GasDetails'));
const ErrorDetails           = lazy(() => import('../components/modals/ErrorDetails'));

const Body = () => {
  const {
    validateInputs,
    account,
    client,
    toAddress,
    valueInWei,
    data,
    userGasLimit,
  } = useTransaction();

  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails,     setErrorDetails]     = useState(null);
  const [txType,           setTxType]           = useState('legacy');

  // ✨ New popup state
  const [popupOpen,   setPopupOpen]   = useState(false);
  const [popupStatus, setPopupStatus] = useState("sending"); // "sending" | "success" | "error"
  const [txHash,      setTxHash]      = useState(null);

  const { status: gasEstimationStatus } = useSelector((state) => state.gasEstimation);

  const handleValidate = () => {
    const isValid = validateInputs();
    if (!isValid) {
      setErrorDetails({
        errorCode: '501',
        errorMessage: 'Invalid transaction details.',
      });
      return;
    }
    setErrorDetails(null);
    setValidationPassed(true);
  };

  const { data: txRequestData } = usePrepareTransactionRequest({
    to: toAddress,
    value: valueInWei ? parseEther(valueInWei.toString()) : undefined,
    data,
    gas: userGasLimit ? BigInt(userGasLimit) : undefined,
  });

  const { sendTransactionAsync } = useSendTransaction();

  const handleSendTransaction = async () => {
    try {
      // ✨ show popup & set status "sending"
      setPopupOpen(true);
      setPopupStatus("sending");
      setTxHash(null);

      const result = await sendTransactionAsync(txRequestData);
      // wagmi v1 returns { hash } – adjust if you’re on a different version
      setTxHash(result?.hash || result); 
      setPopupStatus("success");

      // optional: auto-close after 2s
      // setTimeout(() => setPopupOpen(false), 2000);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      setErrorDetails({
        errorCode: '502',
        errorMessage: 'Transaction failed to send.',
      });
      setPopupStatus("error");
      setPopupOpen(true); // make sure it’s open to show error
    }
    // ✨ DO NOT close in finally – we want the user to see success/error
  };

  const isAccountConnected = account.status === 'connected';

  return (
    <div className="min-h-screen w-full px-4 py-12">
      {/* ✨ popup render with props */}
      {popupOpen && (
        <RetroSendingPopup
          status={popupStatus}
          txHash={txHash}
          onClose={() => setPopupOpen(false)}
        />
      )}

      <div className="w-full max-w-full space-y-4">

        {/* Network alert card */}
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <CustomNetworkAlert
            chainId={client?.chain?.id}
            address={account?.address}
            txType={txType}
            setTxType={setTxType}
          />
        </div>

        {/* Transaction details card */}
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <Suspense fallback={<div className="text-xs text-white font-mono">Loading transaction details...</div>}>
            <TransactionDetailsInput />
          </Suspense>

          {/* Buttons bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full">
             <ValidateButton shouldBeActive={isAccountConnected} onClick={handleValidate} className="flex-1 text-customOlive" /> 
             <OverrideButton shouldBeActive={isAccountConnected} onClick={handleValidate} className="flex-1 text-customOlive" /> 
             </div>
        </div>

        {/* Gas / error sections */}
        {validationPassed ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <Suspense fallback={<div className="text-xs text-white font-mono">Loading gas details...</div>}>
              <GasDetailsOutput txType={txType} />
            </Suspense>

            {/* Send button */}
            <div className="mt-4 flex justify-center">
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <SendToNetworkButton
                  isValid={gasEstimationStatus === 'succeeded'}
                  onClick={handleSendTransaction}
                />
              </div>
            </div>
          </div>
        ) : errorDetails ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <Suspense fallback={<div className="text-xs text-white font-mono">Loading error details...</div>}>
              <ErrorDetails
                errorCode={errorDetails.errorCode}
                errorMessage={errorDetails.errorMessage}
              />
            </Suspense>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Body;
