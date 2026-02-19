"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LeftBar } from "../ui/LeftBar";
import { Loader } from "../ui/Loader";
import { getApiBase } from "@/lib/api";
import { login as loginApi, setToken, walletNonce, walletLogin } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";
import LanguageDropdown from "../ui/LanguageDropdown";
import ThemeToggle from "../ThemeToggle";
import ForgotPassword from "../ui/forgotPassword";
import { useTranslation } from "react-i18next";
import GenericInput from "../ui/GenericInput";
import { enforceVersion } from "@/lib/version";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useDisconnect, useSignMessage, useAccount } from "wagmi";

export const NewLoginIndex = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletAuthRequested, setWalletAuthRequested] = useState(false);
  const { setTheme } = useTheme();
  const isFormValid = email.trim() !== "" && password.trim() !== "";
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { open: openAppKit, close: closeAppKit } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { connector } = useAccount();
  const authInProgress = useRef(false);

  useEffect(() => {
    enforceVersion();
  }, []);

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
      setTheme("dark");
      await refreshUser();
      router.push("/dashboard?login=success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Wallet login failed";
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
  }, [connector, signMessageAsync, closeAppKit, disconnect, refreshUser, router, setTheme, t]);

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
      router.replace("/login", { scroll: false });
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoginLoading(true);
    try {
      const { token } = await loginApi({ email, password });
      setToken(token);
      setTheme("dark");
      await refreshUser();
      router.push("/dashboard?login=success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("Login failed");
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const startOAuth = (provider: "google" | "apple") => {
    const base = getApiBase();
    const url = `${base}/auth/oauth/${provider}`;
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

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (handled) return;
      if (event.data?.type === 'varntix-oauth-success' && event.data.token) {
        handled = true;
        cleanup();
        setToken(event.data.token);
        setTheme('dark');
        await refreshUser();
        router.push('/dashboard?login=success');
      } else if (event.data?.type === 'varntix-oauth-error') {
        handled = true;
        cleanup();
        toast.error(event.data.message || t('Login failed'));
      }
    };

    const handleStorage = async (event: StorageEvent) => {
      if (event.key !== 'varntix-oauth-result' || !event.newValue) return;
      if (handled) return;
      try {
        const data = JSON.parse(event.newValue);
        if (data.type === 'varntix-oauth-success' && data.token) {
          handled = true;
          cleanup();
          setToken(data.token);
          setTheme('dark');
          await refreshUser();
          router.push('/dashboard?login=success');
        } else if (data.type === 'varntix-oauth-error') {
          handled = true;
          cleanup();
          toast.error(data.message || t('Login failed'));
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

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="xl:flex xl:min-h-screen dark:bg-[#070707]">
      {/* LEFT – static */}
      <ForgotPassword isOpen={open} onClose={() => setOpen(false)} />
      <div className="hidden xl:block">
        <LeftBar />
      </div>

      <div className="flex pl-4 pr-4 items-center justify-between xl:hidden pt-5 pb-4">
        <button
          onClick={handleBack}
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
        <h2 className="text-sm leading-tight font-medium font-ui text-[#656565] dark:text-white">Login</h2>
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

      {/* RIGHT – scrollable */}
      <main className="mx-auto  relative xl:ml-[50%] max-lg:px-1 w-full overflow-y-auto xl:min-h-screen flex items-center justify-center">
        <div className="xl:flex justify-between w-full px-5 absolute top-5 hidden">
          <div className="xl:flex hidden max-w-50 4xl:max-w-70 w-full top-5 left-5 justify-between items-center">
            <Image
              width={19.5}
              height={17}
              src={"/assets/greyArrow.svg"}
              alt=""
            />
            <h2 className="text-sm font-medium font-ui text-[#656565] dark:text-white">
              Login
            </h2>
          </div>
          <div className="hidden right-5 top-5 xl:flex gap-4">
            <LanguageDropdown />
            <ThemeToggle />
          </div>
        </div>

        <div
          className="max-w-sm max-lg:px-4 mx-auto w-full pb-6 lg:pb-12 lg:py-12 xl:pt-16"
        >
          <div
            className="    "
          >
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              {/* Email */}
              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor="login-email"
                  className="pl-2 text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
                >
                  {t("Email")}
                </label>

                <GenericInput
                  type="email"
                  placeholder={t("Enter Email Address")}
                  id="login-email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor="signup-password"
                  className="pl-2 text-sm font-normal font-ui text-[#656565A6] dark:text-[#FFFFFFA6]"
                >
                  {t("Password")}
                </label>
                <div className="flex h-9 relative gap-4 items-center bg-[#FFFFFF] border border-[#65656526] dark:border-transparent dark:bg-[#111111] text-sm rounded-full font-ui font-normal px-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="signup-password"
                    value={password}
                    placeholder={t("Enter Password")}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="placeholder:text-[#65656566] w-full dark:placeholder:text-[#FFFFFF66]  outline-none bg-transparent border-none flex-1 text-[#656565A6] dark:text-[#FFFFFFA6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-[50%] -translate-y-1/2 right-6"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Image
                      className="max-w-full h-auto w-full"
                      width={1000}
                      height={1000}
                      src="/assets/View-1--Streamline-Ultimate.png"
                      alt=""
                    />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid || loginLoading}
                className="h-9 mt-2 rounded-full flex items-center justify-center w-auto mx-auto px-10 font-normal font-ui text-sm transition-all duration-150 enabled:text-black enabled:hover:brightness-110 enabled:hover:shadow-lg enabled:active:scale-[0.97] enabled:active:brightness-95 disabled:bg-[#0000001A] dark:disabled:bg-[#FFFFFF1A] disabled:border disabled:border-[#FFFFFF1A] disabled:text-[#656565CC] dark:disabled:text-[#ffff] disabled:cursor-not-allowed"
                style={
                  isFormValid && !loginLoading
                    ? {
                        background:
                          "linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)",
                      }
                    : {}
                }
              >
                {loginLoading ? (
                  <Loader
                    className="h-5 w-5 text-black"
                    ariaLabel="Logging in"
                  />
                ) : (
                  t("Continue")
                )}
              </button>

              {/* OR divider */}
              <div className="flex mt-2 flex-col">
                <div className="flex gap-3 pb-3 items-center">
                  <div className="h-px bg-[#6565651F] dark:bg-[#D9D9D91F] w-full"></div>
                  <span className="font-medium font-ui text-[#65656580] dark:text-[#FFFFFF60] text-xs">
                    {t("OR")}
                  </span>
                  <div className="h-px bg-[#6565651F] dark:bg-[#D9D9D91F] w-full"></div>
                </div>
                {/* OAuth buttons - horizontal icon row */}
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
                <button
                  onClick={() => {
                    setOpen(true);
                  }}
                  className="max-w-max mx-auto text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFCC] pt-4 lg:pt-6 hover:underline hover:text-[#656565CC] dark:hover:text-white transition-colors duration-150"
                >
                  {t("Forgot password?")}
                </button>
                <p className="text-sm font-normal text-center pt-3 font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                  {t("nothaveaccount")}{" "}
                  <Link
                    href={"/sign-up"}
                    className="cursor-pointer text-[#656565] dark:text-white"
                  >
                    {t("SignUp")}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
