"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { PhoneInput } from "../ui/PhoneInput";
import { getApiBase } from "@/lib/api";
import { LeftBar } from "../ui/LeftBar";
import { OtpScreen } from "./otpScreen";
import { FinalStep } from "./userDetails";
import { sendSignupOtp, setToken, walletNonce, walletLogin } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "../ui/Loader";
import ThemeToggle from "../ThemeToggle";
import LanguageDropdown from "../ui/LanguageDropdown";
import { useTranslation } from "react-i18next";
import GenericInput from "../ui/GenericInput";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect, useSignMessage, useAccount } from "wagmi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "login" | "otp" | "final";

export const NewSignUpIndex = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("login");
  const [activeTab, setActiveTab] = useState("personal");
  const fullPhoneRef = useRef("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAuthRequested, setWalletAuthRequested] = useState(false);
  const [signupToken, setSignupToken] = useState<string | null>(null);

  const { open: openAppKit, close: closeAppKit } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { connector } = useAccount();
  const authInProgress = useRef(false);

  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const isPhoneNotEmpty = (phone || "").trim().replace(/\D/g, "").length >= 6;
  const isFormValid = isEmailValid && isPhoneNotEmpty;

  const doWalletAuth = useCallback(async (walletAddress: string) => {
    if (authInProgress.current) return;
    authInProgress.current = true;
    setWalletLoading(true);

    try {
      // Wait for wagmi connector to be fully ready (critical for Trust Wallet / WalletConnect)
      let retries = 0;
      while (!connector && retries < 20) {
        await new Promise(r => setTimeout(r, 300));
        retries++;
      }

      const { nonce } = await walletNonce(walletAddress);

      const domain = window.location.host;
      const origin = window.location.origin;
      const issuedAt = new Date().toISOString();
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        walletAddress,
        '',
        'By signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.',
        '',
        `URI: ${origin}`,
        `Version: 1`,
        `Chain ID: 1`,
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
      ].join('\n');

      const signature = await signMessageAsync({ message });

      // Close the AppKit modal AFTER signing succeeds
      closeAppKit().catch(() => {});

      const { token } = await walletLogin({
        address: walletAddress,
        message,
        signature,
      });

      setToken(token);
      await refreshUser();
      router.push("/dashboard?login=success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Wallet signup failed";
      if (!msg.includes("User rejected") && !msg.includes("user rejected") && !msg.includes("Connector not connected")) {
        toast.error(msg);
      }
      disconnect();
    } finally {
      setWalletLoading(false);
      authInProgress.current = false;
      setWalletAuthRequested(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connector, signMessageAsync, closeAppKit, disconnect, refreshUser, router, t]);

  useEffect(() => {
    if (!walletAuthRequested || !isConnected || !address) return;
    doWalletAuth(address);
  }, [walletAuthRequested, isConnected, address, doWalletAuth]);

  const handleConnectWallet = async () => {
    try {
      if (isConnected) {
        disconnect();
        await new Promise(r => setTimeout(r, 300));
      }
      setWalletAuthRequested(true);
      await openAppKit();
    } catch {
      toast.error(t("Failed to open wallet modal"));
    }
  };

  const handleContinueToOtp = async () => {
    if (!isFormValid) return;

    const fullPhone = fullPhoneRef.current || phone.replace(/\D/g, "");
    if (!fullPhone) {
      toast.error(t("Please enter a valid phone number"));
      return;
    }

    setLoading(true);
    try {
      await sendSignupOtp({
        email: email.trim().toLowerCase(),
        phone: fullPhone,
      });

      setPendingEmail(email.trim().toLowerCase());
      setPendingPhone(fullPhone);
      setStep("otp");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Failed to send code");
      const isPhoneTaken =
        typeof msg === "string" &&
        msg.toLowerCase().includes("phone") &&
        msg.toLowerCase().includes("already");
      toast.error(
        isPhoneTaken ? t("This phone number is already registered") : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  const startOAuth = (provider: "google" | "apple") => {
    const base = getApiBase();
    const params = new URLSearchParams();
    if (refCode?.trim()) params.set("ref", refCode.trim());
    const query = params.toString();
    const url = `${base}/auth/oauth/${provider}${query ? `?${query}` : ""}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      url,
      `varntix-${provider}-auth`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    let handled = false;
    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (handled) return;
      if (event.data?.type === 'varntix-oauth-success' && event.data.token) {
        handled = true;
        cleanup();
        setToken(event.data.token);
        window.location.href = '/dashboard?login=success';
      } else if (event.data?.type === 'varntix-oauth-error') {
        handled = true;
        cleanup();
        toast.error(event.data.message || 'Sign up failed');
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'varntix-oauth-result' || !event.newValue) return;
      if (handled) return;
      try {
        const data = JSON.parse(event.newValue);
        if (data.type === 'varntix-oauth-success' && data.token) {
          handled = true;
          cleanup();
          setToken(data.token);
          window.location.href = '/dashboard?login=success';
        } else if (data.type === 'varntix-oauth-error') {
          handled = true;
          cleanup();
          toast.error(data.message || 'Sign up failed');
        }
      } catch { /* ignore parse errors */ }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);

    if (!popup || popup.closed) {
      cleanup();
      window.location.href = url;
    }
  };

  return (
    <div className="xl:flex xl:min-h-screen bg-white dark:bg-[#070707]">
      {/* LEFT */}
      <div className="hidden xl:block">
        <LeftBar />
      </div>

      {/* MOBILE HEADER */}
      <div className="flex pl-4 pr-4 items-center justify-between xl:hidden pt-5 pb-3">
        {step === "login" ? (
          <Link
            href={"/login"}
            className="w-11.5 h-11.5 flex items-center justify-center rounded-[9px] bg-[#F6F8FA] border border-[#E9E9E9] dark:bg-[#262628]   dark:border-transparent"
          >
            <Image
              width={20}
              height={18}
              src="/assets/Vector 63.png"
              className=" hidden dark:block"
              alt=""
            />
            <Image
              width={20}
              height={18}
              src="/assets/Vector 63 (2).svg"
              className="dark:hidden"
              alt=""
            />
          </Link>
        ) : step === "otp" ? (
          <button
            onClick={() => {
              setStep("login");
            }}
            className="w-11.5 h-11.5 flex items-center justify-center rounded-[9px] bg-[#F6F8FA] border border-[#E9E9E9] dark:bg-[#262628]   dark:border-transparent"
          >
            <Image
              width={20}
              height={18}
              src="/assets/Vector 63.png"
              className=" hidden dark:block"
              alt=""
            />
            <Image
              width={20}
              height={18}
              src="/assets/Vector 63 (2).svg"
              className="dark:hidden"
              alt=""
            />
          </button>
        ) : (
          <button
            onClick={() => {
              setStep("otp");
            }}
            className="w-11.5 h-11.5 flex items-center justify-center rounded-[9px] bg-[#F6F8FA] border border-[#E9E9E9] dark:bg-[#262628]   dark:border-transparent"
          >
            <Image
              width={20}
              height={18}
              src="/assets/Vector 63.png"
              className=" hidden dark:block"
              alt=""
            />
            <Image
              width={20}
              height={18}
              src="/assets/Vector 63 (2).svg"
              className="dark:hidden"
              alt=""
            />
          </button>
        )}
        {step === "login" ? (
          <span className="text-sm text-[#656565] dark:text-white font-medium leading-tight font-ui">
            {t("CreateAccount")}
          </span>
        ) : step === "otp" ? (
          <span className="text-sm text-[#656565] dark:text-white font-medium leading-tight font-ui">
            {t("UserProfile")}
          </span>
        ) : (
          <span className="text-sm text-[#656565] dark:text-white font-medium leading-tight font-ui">
            {t("UserProfile")}
          </span>
        )}
        <div className="flex gap-3 items-center">
          <Image
            width={24}
            height={24}
            src="/assets/Group 1597887194.svg"
            className="hamburger cursor-pointer"
            alt="menu"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}
        {/* Mobile Dropdown Menu */}
        <div
          className="fixed top-0 left-0 w-full bg-white dark:bg-black shadow-md z-50"
          style={{
            transition: 'transform 0.3s ease-in-out',
            WebkitTransition: '-webkit-transform 0.3s ease-in-out',
            transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
            WebkitTransform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          }}
        >
          <div className="flex flex-col items-center gap-4 py-6">
            <LanguageDropdown />
            <ThemeToggle />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <main className="dark:bg-[#070707] mx-auto xl:ml-[50%] relative max-lg:px-1 w-full overflow-y-auto xl:min-h-screen flex items-center justify-center">
        <div className="xl:flex justify-between w-full px-5 absolute top-5 hidden">
          {step === "login" ? (
            <div className="xl:flex hidden max-w-97.5 w-full justify-between items-center">
              <Image
                width={19.5}
                height={17}
                src={"/assets/greyArrow.svg"}
                alt=""
              />
              <h2 className="text-sm font-medium font-ui text-[#656565] dark:text-white">
                Create Account
              </h2>
            </div>
          ) : (
            <div></div>
          )}
          <div className="hidden right-5 top-5 xl:flex gap-4">
            <LanguageDropdown />
            <ThemeToggle />
          </div>
        </div>

        <>
          {step === "login" && (
            <div
              className="max-w-sm max-lg:px-4 mx-auto w-full pb-4 lg:pb-12 lg:py-12 xl:pt-16"
            >
              <div>
                <div className="flex flex-col gap-3">
                  {" "}
                  <div className="flex flex-col gap-2.5">
                    {" "}
                    <label
                      htmlFor="login-email"
                      className="pl-1 text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
                    >
                      {" "}
                      {t("Email")}{" "}
                    </label>{" "}
                    <GenericInput
                      id="login-email"
                      placeholder={t("Enter Email Address")}
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>{" "}
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    onFullChange={(full) => {
                      fullPhoneRef.current = full;
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleContinueToOtp}
                    disabled={!isFormValid || loading}
                    className="h-9 mt-2 rounded-full flex items-center justify-center w-auto mx-auto px-10 font-normal font-ui text-sm transition-all duration-200 enabled:text-black enabled:hover:brightness-110 enabled:hover:shadow-lg disabled:bg-[#0000001A] dark:disabled:bg-[#FFFFFF1A] disabled:border disabled:border-[#FFFFFF1A] disabled:text-[#656565CC] dark:disabled:text-[#FFFFFF80] disabled:cursor-not-allowed"
                    style={
                      isFormValid && !loading
                        ? {
                            background:
                              "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)",
                          }
                        : {}
                    }
                  >
                    {loading ? (
                      <Loader
                        className="h-5 w-5 text-white"
                        ariaLabel="Sending OTP"
                      />
                    ) : (
                      t("Continue")
                    )}
                  </button>
                  <div className="flex mt-2 flex-col">
                    <div className="flex gap-3 pb-3 items-center">
                      <div className="h-px bg-[#6565651F] dark:bg-[#D9D9D91F] w-full"></div>
                      <span className="font-medium font-ui text-[#65656580] dark:text-[#FFFFFF60] text-xs">
                        {t("OR")}
                      </span>
                      <div className="h-px bg-[#6565651F] dark:bg-[#D9D9D91F] w-full"></div>
                    </div>
                    <div className="flex flex-row gap-4 justify-center w-full">
                      <button
                        type="button"
                        onClick={() => startOAuth("google")}
                        title={t("ContinuewithGoogle")}
                        className="h-11 w-11 shrink-0 justify-center border text-[#656565] dark:text-white border-[#65656526] dark:border-[#FFFFFF1A] bg-transparent hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF0A] active:scale-[0.95] flex items-center rounded-full transition-all duration-150"
                      >
                        <Image
                          width={20}
                          height={20}
                          priority
                          src="/assets/google (1) 1.svg"
                          alt="Google"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => startOAuth("apple")}
                        title={t("ContinuewithApple")}
                        className="h-11 w-11 shrink-0 justify-center border text-[#656565] dark:text-white border-[#65656526] dark:border-[#FFFFFF1A] bg-transparent hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF0A] active:scale-[0.95] flex items-center rounded-full transition-all duration-150"
                      >
                        <Image
                          width={20}
                          height={20}
                          className="hidden dark:block"
                          priority
                          src="/assets/apple-logo 1.svg"
                          alt="Apple"
                        />
                        <Image
                          width={20}
                          height={20}
                          className="dark:hidden"
                          priority
                          src="/assets/apple-logo 1 (1).svg"
                          alt="Apple"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={handleConnectWallet}
                        disabled={walletLoading}
                        title={t("Connect Wallet")}
                        className="h-11 w-11 shrink-0 justify-center border text-[#656565] dark:text-white border-[#65656526] dark:border-[#FFFFFF1A] bg-transparent hover:bg-[#0000000A] dark:hover:bg-[#FFFFFF0A] active:scale-[0.95] flex items-center rounded-full transition-all duration-150"
                      >
                        {walletLoading ? (
                          <Loader className="h-4 w-4" ariaLabel="Connecting wallet" />
                        ) : (
                          <Image
                            width={32}
                            height={32}
                            priority
                            unoptimized
                            src="/assets/walletconnect-logo.png"
                            alt="WalletConnect"
                            className="rounded-full"
                          />
                        )}
                      </button>
                    </div>
                    <p className="text-sm font-normal text-center pt-3 font-ui text-[#65656580] dark:text-[#FFFFFF66]">
                      {" "}
                      {t("nothaveaccount")}{" "}
                      <Link
                        href={"/login"}
                        className="cursor-pointer text-[#656565] dark:text-white"
                      >
                        {" "}
                        {t("Log in")}{" "}
                      </Link>{" "}
                    </p>{" "}
                  </div>{" "}
                </div>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div
              className="flex flex-col gap-3.25"
            >
              <OtpScreen
                email={pendingEmail}
                phone={pendingPhone}
                onVerified={(token) => {
                  setSignupToken(token);
                  setStep("final");
                }}
                onBack={() => setStep("login")}
              />
              <div className="md:hidden h-62.5 w-full flex-col gap-3 text-center rounded-[20px] relative flex items-center justify-center">
                <Image
                  width={1000}
                  height={1000}
                  alt=""
                  src={"/assets/signupOtp.png"}
                  className="max-w-full h-full absolute left-0 top-0"
                />
                <h2 className="relative max-xxs:text-[38px] text-[42px] font-semibold font-ui leading-[100%]">
                  {t("Digitalassetinvesting")}
                </h2>
                <p className="max-w-87.5 relative w-full text-[20px] font-ui leading-[100%]">
                  {t("smarterplatform")}
                </p>
              </div>
            </div>
          )}

          {step === "final" && signupToken && (
            <div
              className="w-full"
            >
              <FinalStep signupToken={signupToken} refCode={refCode} />
            </div>
          )}
        </>
      </main>
    </div>
  );
};
