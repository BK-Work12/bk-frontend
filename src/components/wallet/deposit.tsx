"use client";
import React, { useState } from "react";
import { GradientBorderGray } from "../ui/gradientBorder";
import Image from "next/image";
import { CryptoStep2 } from "./cryptoStep2";
import { Web3Step2 } from "./Web3Step2";
import { CardStep } from "./cardStep";
import type { CreateDepositResponse } from "@/lib/api";
import { useTranslation } from "react-i18next";

export const Deposit = () => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<string | null>("crypto");
  const [showStep1, setShowStep1] = useState(true);

  /** KYC (Sumsub) required only for deposits of this amount or higher (USD). */
  const KYC_REQUIRED_AMOUNT = 5000;

  const depositMethods = [
    {
      id: "crypto",
      label: t("Transfer Crypto"),
      img: "/assets/Visa--Streamline-Svg-Logos.png",
      bgColor: "#3d3d3d",
      textColor: "#FFFFFF",
      switch: true,
    },
    {
      id: "web3",
      label: t("Connect Web3 Wallet"),
      img: "",
      bgColor: "#3d3d3d",
      textColor: "#FFFFFF",
      web3: true,
    },
    {
      id: "card",
      label: t("CardPayment"),
      img: "/assets/Visa--Streamline-Svg-Logos (1).png",
      bgColor: "#3d3d3d",
      textColor: "#FFFFFF",
    },
  ];

  const handleNextStep = () => {
    setShowStep1(false);
  };

  return (
    <>
      {showStep1 && (
        <div className="py-3 lg:py-8 max-lg:pl-3.5 max-lg:pr-4 max-w-[540px] lg:max-w-[820px] w-full mx-auto flex flex-col gap-3 lg:gap-5">
          <div className="flex flex-row gap-2 justify-between items-center px-4.25">
            <h2 className="text-sm lg:text-base font-medium font-ui leading-tight dark:text-white text-[#656565]">
              {t("Selectdepositmethod")}
            </h2>
            <span className="text-xs lg:text-sm text-[#65656566] dark:text-[#FFFFFF66] font-ui leading-tight font-normal">
              {t("Step1outof3")}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {depositMethods.map((method) => {
              const isSelected = selectedMethod === method.id;

              return (
                <div
                  key={method.id}
                  className={`py-3 px-3 rounded-md border text-center cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] active:shadow-sm flex flex-col items-center
                ${
                  isSelected
                    ? "blueGrad dark:bg-[#F5FF1E0A] text-[white] dark:text-[#D5F821] border-transparent dark:border-[#F5FF1E3D]"
                    : "text-[#656565] dark:text-[#FFFFFF] bg-white border border-[#65656526] dark:border-transparent dark:bg-[#111111] hover:border-[#FFFFFF40] dark:hover:bg-[#1A1A1A]"
                }
              `}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-center py-1.5 flex-1">
                    {method.switch ? (
                      <div className="flex gap-1.5 flex-col">
                        <div className="flex gap-2 justify-center">
                          <Image src="/assets/bitcoin (7) 1.svg" alt="Bitcoin" width={24} height={24} className="w-6 h-6 lg:w-7 lg:h-7" />
                          <Image src="/assets/ethereum (8) 1.svg" alt="Ethereum" width={24} height={24} className="w-6 h-6 lg:w-7 lg:h-7" />
                          <Image src="/assets/usdt (6) 1.svg" alt="USDT" width={24} height={24} className="w-6 h-6 lg:w-7 lg:h-7" />
                        </div>
                        <div className="flex justify-center gap-2">
                          <Image src="/assets/token-branded_solana (1).svg" alt="Solana" width={24} height={24} className="w-6 h-6 lg:w-7 lg:h-7" />
                          <Image src="/assets/usdc (3) 1.svg" alt="USDC" width={24} height={24} className="w-6 h-6 lg:w-7 lg:h-7" />
                          <Image src="/assets/xrp (11) 1.svg" alt="XRP" width={24} height={24} className="w-6 h-6 lg:w-7 lg:h-7" />
                        </div>
                      </div>
                    ) : (method as any).web3 ? (
                      <div className="flex gap-4 items-center justify-center">
                        <Image src="/assets/metamask-logo.png" alt="MetaMask" width={32} height={32} className="w-8 h-8 lg:w-9 lg:h-9 object-contain" unoptimized />
                        <Image src="/assets/trust-wallet-icon.png" alt="Trust Wallet" width={32} height={32} className="w-8 h-8 lg:w-9 lg:h-9 object-contain" />
                        <Image src="/assets/exodus-icon.png" alt="Exodus" width={32} height={32} className="w-8 h-8 lg:w-9 lg:h-9 object-contain" />
                      </div>
                    ) : (
                      <div className="flex gap-3 lg:gap-6 items-center justify-center">
                        <Image src="/assets/visaCard.svg" className="hidden dark:block" alt="Visa" width={40} height={14} />
                        <Image src="/assets/visaLight.svg" className=" dark:hidden" alt="Visa" width={40} height={14} />
                        <Image src="/assets/Mastercard--Streamline-Svg-Logos.svg" alt="Mastercard" width={32} height={32} />
                        <Image src="/assets/applePay.svg" alt="Apple Pay" className="hidden dark:block" width={44} height={18} />
                        <Image src="/assets/appleLight.svg" alt="Apple Pay" className=" dark:hidden" width={44} height={18} />
                      </div>
                    )}
                  </div>
                  <h2 className="text-xs lg:text-sm font-medium font-ui mt-auto pt-1">
                    {method.label}
                  </h2>
                </div>
              );
            })}
          </div>

          <button
            className="h-9 lg:h-11 relative overflow-hidden rounded-full flex items-center justify-center w-full font-normal font-ui text-sm text-[#000000] hover:brightness-110 hover:shadow-lg transition-all duration-200 disabled:text-[#656565]"
            style={{
              background: "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)",
            }}
            onClick={handleNextStep}
            disabled={!selectedMethod} // disable if nothing selected
          >
            <Image
              width={1000}
              height={1000}
              src="/assets/Frame 15.svg"
              className="absolute z-0 w-full h-full top-0 left-0"
              alt=""
            />
            <span className="relative text-black font-normal font-ui text-sm">
              {t("NextStep")}
            </span>
          </button>
        </div>
      )}
      {!showStep1 && (
        <>
          {selectedMethod === "crypto" && (
            <CryptoStep2
              setShowStep1={setShowStep1}
              kycRequiredAmount={KYC_REQUIRED_AMOUNT}
            />
          )}
          {selectedMethod === "web3" && (
            <Web3Step2
              setShowStep1={setShowStep1}
              kycRequiredAmount={KYC_REQUIRED_AMOUNT}
            />
          )}
          {selectedMethod === "card" && (
            <CardStep
              setShowStep1={setShowStep1}
              onSwitchToCrypto={() => {
                setSelectedMethod("crypto");
              }}
              kycRequiredAmount={KYC_REQUIRED_AMOUNT}
            />
          )}
        </>
      )}
    </>
  );
};
