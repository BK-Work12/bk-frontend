'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ProfilePageIndex = void 0;
var react_1 = require("react");
var react_toastify_1 = require("react-toastify");
var arrowDown_1 = require("../icons/arrowDown");
var skeleton_1 = require("../ui/skeleton");
var auth_1 = require("@/lib/auth");
var AuthContext_1 = require("@/context/AuthContext");
var image_1 = require("next/image");
var PhoneInput_1 = require("../ui/PhoneInput");
var Loader_1 = require("../ui/Loader");
var libphonenumber_js_1 = require("libphonenumber-js");
var world_countries_1 = require("world-countries");
var CountryDropdown_1 = require("../ui/CountryDropdown");
var framer_motion_1 = require("framer-motion");
var react_i18next_1 = require("react-i18next");
var countryList = world_countries_1["default"].map(function (c) { return c.name.common; }).sort(function (a, b) { return a.localeCompare(b); });
/** Format raw input as MM/DD/YYYY (digits only, max 8). */
function formatDateOfBirthInput(raw) {
    var digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2)
        return digits;
    if (digits.length <= 4)
        return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
}
/** Strip country code from E.164 phone for display (national number only). */
function phoneWithoutCountryCode(phone) {
    var _a;
    if (!(phone === null || phone === void 0 ? void 0 : phone.trim()))
        return '';
    try {
        var parsed = libphonenumber_js_1.parsePhoneNumber(phone);
        return (_a = parsed === null || parsed === void 0 ? void 0 : parsed.nationalNumber) !== null && _a !== void 0 ? _a : phone;
    }
    catch (_b) {
        return phone;
    }
}
/** Normalize stored value (e.g. YYYY-MM-DD or MM/DD/YYYY) to display MM/DD/YYYY. */
function normalizeDateOfBirthDisplay(value) {
    var trimmed = (value || '').trim();
    if (!trimmed)
        return '';
    var iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (iso)
        return iso[2] + "/" + iso[3] + "/" + iso[1];
    return formatDateOfBirthInput(trimmed);
}
exports.ProfilePageIndex = function () {
    var _a, _b, _c, _d;
    var t = react_i18next_1.useTranslation().t;
    var _e = AuthContext_1.useAuth(), user = _e.user, loading = _e.loading, refreshUser = _e.refreshUser;
    var _f = react_1.useState(false), saveLoading = _f[0], setSaveLoading = _f[1];
    var _g = react_1.useState(false), walletSaveLoading = _g[0], setWalletSaveLoading = _g[1];
    var _h = react_1.useState(false), residencySaveLoading = _h[0], setResidencySaveLoading = _h[1];
    var _j = react_1.useState(''), firstName = _j[0], setFirstName = _j[1];
    var _k = react_1.useState(''), lastName = _k[0], setLastName = _k[1];
    var _l = react_1.useState(''), dateOfBirth = _l[0], setDateOfBirth = _l[1];
    var _m = react_1.useState(''), phone = _m[0], setPhone = _m[1];
    var _o = react_1.useState(''), email = _o[0], setEmail = _o[1];
    var _p = react_1.useState(false), copied = _p[0], setCopied = _p[1];
    var _q = react_1.useState(''), walletAddress = _q[0], setWalletAddress = _q[1];
    var _r = react_1.useState(''), selected = _r[0], setSelected = _r[1];
    var _s = react_1.useState(false), networkOpen = _s[0], setNetworkOpen = _s[1];
    var _t = react_1.useState(false), currencyOpen = _t[0], setCurrencyOpen = _t[1];
    var _u = react_1.useState('Select Network'), network = _u[0], setNetwork = _u[1];
    var _v = react_1.useState('Select Currency'), currency = _v[0], setCurrency = _v[1];
    var _w = react_1.useState(''), addressLine1 = _w[0], setAddressLine1 = _w[1];
    var _x = react_1.useState(''), addressLine2 = _x[0], setAddressLine2 = _x[1];
    var _y = react_1.useState(''), city = _y[0], setCity = _y[1];
    var _z = react_1.useState(''), province = _z[0], setProvince = _z[1];
    var _0 = react_1.useState(''), postCode = _0[0], setPostCode = _0[1];
    var _1 = react_1.useState({}), personalErrors = _1[0], setPersonalErrors = _1[1];
    var _2 = react_1.useState({}), residencyErrors = _2[0], setResidencyErrors = _2[1];
    var _3 = react_1.useState({}), walletErrors = _3[0], setWalletErrors = _3[1];
    var allNetworks = [
        { label: 'Ethereum', icon: '/assets/ethereum (8) 1.svg' },
        { label: 'Tron', icon: '/assets/token-branded_tron.svg' },
        { label: 'Solana', icon: '/assets/token-branded_solanaa.svg' },
    ];
    var allCurrencies = [
        { label: 'USDT', icon: '/assets/usdt (6) 1.svg' },
        { label: 'USDC', icon: '/assets/usdc (3) 1.svg' },
        { label: 'SOL', icon: '/assets/token-branded_solanaa.svg' },
        { label: 'ETH', icon: '/assets/ethereum (8) 1.svg' },
    ];
    /** Networks that support each currency */
    var currencyToNetworkLabels = {
        USDT: ['Ethereum', 'Tron'],
        USDC: ['Ethereum', 'Solana'],
        SOL: ['Solana'],
        ETH: ['Ethereum']
    };
    /** Currencies supported on each network */
    var networkToCurrencyLabels = {
        Ethereum: ['USDT', 'USDC', 'ETH'],
        Tron: ['USDT'],
        Solana: ['SOL']
    };
    var getNetworksForCurrency = function (currencyLabel) {
        var _a, _b, _c;
        var key = (_b = (_a = (typeof currencyLabel === 'string' ? currencyLabel : currencyLabel.label)) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
        var names = (_c = currencyToNetworkLabels[key]) !== null && _c !== void 0 ? _c : [];
        return allNetworks.filter(function (n) { return names.includes(n.label); });
    };
    var getCurrenciesForNetwork = function (networkLabel) {
        var _a, _b, _c;
        var key = (_b = (_a = (typeof networkLabel === 'string' ? networkLabel : networkLabel.label)) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
        var names = (_c = networkToCurrencyLabels[key]) !== null && _c !== void 0 ? _c : [];
        return allCurrencies.filter(function (c) { return names.includes(c.label); });
    };
    var currentNetworkLabel = typeof network === 'object' ? network === null || network === void 0 ? void 0 : network.label : network !== 'Select Network' ? network : '';
    var currenciesToShow = currentNetworkLabel ? getCurrenciesForNetwork(currentNetworkLabel) : allCurrencies;
    var networkRef = react_1.useRef(null);
    var currencyRef = react_1.useRef(null);
    var _4 = react_1.useState(false), networkUp = _4[0], setNetworkUp = _4[1];
    var _5 = react_1.useState(false), currencyUp = _5[0], setCurrencyUp = _5[1];
    /** Validate wallet address format for the selected network (TC-E2). */
    function validateWalletByNetwork(address, network) {
        var trimmed = address.trim();
        if (!trimmed)
            return 'Wallet address is required';
        switch (network) {
            case 'Ethereum':
                return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? null : t('Enter a valid address');
            case 'Tron':
                return /^T[a-zA-HJ-NP-Z0-9]{33}$/.test(trimmed)
                    ? null
                    : t('Enter a valid Tron address (T followed by 33 characters)');
            case 'Solana':
                return trimmed.length >= 32 && trimmed.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)
                    ? null
                    : t('Enter a valid Solana address (32–44 base58 characters)');
            default:
                return t('Please select a network first');
        }
    }
    react_1.useEffect(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        if (!user)
            return;
        setFirstName((_a = user.firstName) !== null && _a !== void 0 ? _a : '');
        setLastName((_b = user.lastName) !== null && _b !== void 0 ? _b : '');
        setEmail((_c = user.email) !== null && _c !== void 0 ? _c : '');
        setPhone(phoneWithoutCountryCode((_d = user.phone) !== null && _d !== void 0 ? _d : ''));
        setDateOfBirth(normalizeDateOfBirthDisplay((_e = user.dateOfBirth) !== null && _e !== void 0 ? _e : ''));
        setSelected((_f = user.country) !== null && _f !== void 0 ? _f : '');
        setWalletAddress((_g = user.walletAddress) !== null && _g !== void 0 ? _g : '');
        setNetwork(user.preferredNetwork
            ? ((_h = allNetworks.find(function (n) { return n.label === String(user.preferredNetwork); })) !== null && _h !== void 0 ? _h : String(user.preferredNetwork))
            : 'Select Network');
        setCurrency(user.preferredCurrency
            ? ((_j = allCurrencies.find(function (c) { return c.label === String(user.preferredCurrency); })) !== null && _j !== void 0 ? _j : String(user.preferredCurrency))
            : 'Select Currency');
        setAddressLine1((_k = user.addressLine1) !== null && _k !== void 0 ? _k : '');
        setAddressLine2((_l = user.addressLine2) !== null && _l !== void 0 ? _l : '');
        setCity((_m = user.city) !== null && _m !== void 0 ? _m : '');
        setProvince((_o = user.province) !== null && _o !== void 0 ? _o : '');
        setPostCode((_p = user.postCode) !== null && _p !== void 0 ? _p : '');
    }, [user]);
    var handleSavePersonal = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err, updated, e_1, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    err = {};
                    if (!(dateOfBirth === null || dateOfBirth === void 0 ? void 0 : dateOfBirth.trim()))
                        err.dateOfBirth = 'Date of birth is required';
                    setPersonalErrors(err);
                    if (Object.keys(err).length > 0) {
                        react_toastify_1.toast.error(t('Please fill in all required fields'));
                        return [2 /*return*/];
                    }
                    setSaveLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, auth_1.updateProfile({
                            firstName: firstName.trim() || undefined,
                            lastName: lastName.trim() || undefined,
                            phone: phone.trim() || undefined,
                            country: selected.trim() || undefined,
                            dateOfBirth: dateOfBirth.trim() || undefined
                        })];
                case 2:
                    updated = _a.sent();
                    if (updated.country)
                        setSelected(updated.country);
                    return [4 /*yield*/, refreshUser()];
                case 3:
                    _a.sent();
                    setPersonalErrors({});
                    react_toastify_1.toast.success('Profile saved.');
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    msg = e_1 instanceof Error ? e_1.message : 'Failed to save';
                    react_toastify_1.toast.error(msg);
                    return [3 /*break*/, 6];
                case 5:
                    setSaveLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveWallet = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err, networkLabel, formatError, e_2, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    err = {};
                    if (!(walletAddress === null || walletAddress === void 0 ? void 0 : walletAddress.trim()))
                        err.walletAddress = t('Wallet address is required');
                    if (network === 'Select Network')
                        err.network = t('Please select a network');
                    if (currency === 'Select Currency')
                        err.currency = t('Please select a currency');
                    if ((walletAddress === null || walletAddress === void 0 ? void 0 : walletAddress.trim()) && network !== 'Select Network') {
                        networkLabel = typeof network === 'string' ? network : network.label;
                        formatError = validateWalletByNetwork(walletAddress.trim(), networkLabel);
                        if (formatError)
                            err.walletAddress = formatError;
                    }
                    setWalletErrors(err);
                    if (Object.keys(err).length > 0) {
                        react_toastify_1.toast.error(t('Please complete wallet details and ensure address matches the selected network'));
                        return [2 /*return*/];
                    }
                    setWalletSaveLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, auth_1.updateProfile({
                            walletAddress: walletAddress.trim() || undefined,
                            preferredNetwork: network !== 'Select Network' ? (typeof network === 'string' ? network : network.label) : undefined,
                            preferredCurrency: currency !== 'Select Currency' ? (typeof currency === 'string' ? currency : currency.label) : undefined
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshUser()];
                case 3:
                    _a.sent();
                    setWalletErrors({});
                    react_toastify_1.toast.success('Wallet saved.');
                    return [3 /*break*/, 6];
                case 4:
                    e_2 = _a.sent();
                    msg = e_2 instanceof Error ? e_2.message : 'Failed to save';
                    react_toastify_1.toast.error(msg);
                    return [3 /*break*/, 6];
                case 5:
                    setWalletSaveLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleSaveResidency = function () { return __awaiter(void 0, void 0, void 0, function () {
        var err, e_3, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    err = {};
                    if (!(addressLine1 === null || addressLine1 === void 0 ? void 0 : addressLine1.trim()))
                        err.addressLine1 = 'Address line 1 is required';
                    if (!(city === null || city === void 0 ? void 0 : city.trim()))
                        err.city = 'City is required';
                    if (!(postCode === null || postCode === void 0 ? void 0 : postCode.trim()))
                        err.postCode = 'Post/Zip code is required';
                    setResidencyErrors(err);
                    if (Object.keys(err).length > 0) {
                        react_toastify_1.toast.error(t('Please fill in all required address fields'));
                        return [2 /*return*/];
                    }
                    setResidencySaveLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, auth_1.updateProfile({
                            addressLine1: addressLine1.trim() || undefined,
                            addressLine2: addressLine2.trim() || undefined,
                            city: city.trim() || undefined,
                            province: province.trim() || undefined,
                            postCode: postCode.trim() || undefined,
                            country: selected.trim() || undefined
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshUser()];
                case 3:
                    _a.sent();
                    setResidencyErrors({});
                    react_toastify_1.toast.success('Residency saved.');
                    return [3 /*break*/, 6];
                case 4:
                    e_3 = _a.sent();
                    msg = e_3 instanceof Error ? e_3.message : 'Failed to save';
                    react_toastify_1.toast.error(msg);
                    return [3 /*break*/, 6];
                case 5:
                    setResidencySaveLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleCopy = function () {
        var text = walletAddress || '0x';
        navigator.clipboard.writeText(text);
        setCopied(true);
        react_toastify_1.toast.success(t('Wallet Address copied'));
        setTimeout(function () { return setCopied(false); }, 1500);
    };
    react_1.useEffect(function () {
        if (!networkOpen || !networkRef.current)
            return;
        var rect = networkRef.current.getBoundingClientRect();
        var spaceBelow = window.innerHeight - rect.bottom;
        setNetworkUp(spaceBelow < 200);
    }, [networkOpen]);
    react_1.useEffect(function () {
        if (!currencyOpen || !currencyRef.current)
            return;
        var rect = currencyRef.current.getBoundingClientRect();
        var spaceBelow = window.innerHeight - rect.bottom;
        setCurrencyUp(spaceBelow < 200);
    }, [currencyOpen]);
    if (loading) {
        return (react_1["default"].createElement("div", { className: "grid grid-cols-1 xl:grid-cols-2 4xl:flex 5xl:grid gap-2" },
            react_1["default"].createElement("div", { className: "4xl:max-w-202.75 w-full 5xl:max-w-full" },
                react_1["default"].createElement("div", { className: "dark:bg-[#FFFFFF05] glassShadowDark  bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-[20px] glass-shadow py-6 px-2.5" },
                    react_1["default"].createElement("div", { className: "pb-6" },
                        react_1["default"].createElement("h2", { className: "text-[22px] text-[#656565] dark:text-white font-ui font-bold px-4.5" }, t('PersonalDetails'))),
                    react_1["default"].createElement("div", { className: "px-4.5 space-y-5 pb-5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-5 lg:gap-y-5 lg:gap-x-3 lg:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                                react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('FirstName')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-[61px] border border-[#65656526] dark:border-transparent w-full rounded-md" })),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                                react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('LastName')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-[61px] border border-[#65656526] dark:border-transparent w-full rounded-md" })),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                                react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('DateofBirth')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-[61px] border border-[#65656526] dark:border-transparent w-full rounded-md" })),
                            react_1["default"].createElement(PhoneInput_1.PhoneInput, { value: phone, onChange: setPhone, userCountry: user === null || user === void 0 ? void 0 : user.country })),
                        react_1["default"].createElement("div", { className: "flex flex-col pb-6.75 gap-2.5" },
                            react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('EmailAddress')),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-15.25 w-full rounded-md" })),
                        react_1["default"].createElement("button", { type: "button", disabled: true, className: "h-15.25 rounded-xl w-full font-semibold font-ui text-[22px] text-[#656565] disabled:opacity-60 cursor-not-allowed", style: { background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' } }, t('SaveChanges')))),
                react_1["default"].createElement("div", { className: "border-[#65656526] mt-3 border dark:border-transparent dark:bg-[#1E1E2080] rounded-[20px] py-6 px-2.5" },
                    react_1["default"].createElement("div", { className: "pb-6" },
                        react_1["default"].createElement("h2", { className: "text-[22px] font-ui font-bold text-[#656565] dark:text-white px-4.5" }, t('ReceivingWallet'))),
                    react_1["default"].createElement("div", { className: "px-4.5 space-y-5" },
                        react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                            react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('WalletAddress')),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-[61px] border border-[#65656526] dark:border-transparent w-full rounded-md" })),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                                react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('Network')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-15.25 w-full rounded-md" })),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                                react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('Currency')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-15.25 w-full rounded-md" }))),
                        react_1["default"].createElement("button", { type: "button", disabled: true, className: "h-15.25 rounded-xl mt-6 w-full font-semibold font-ui text-[22px] text-[#656565] disabled:opacity-60 cursor-not-allowed", style: { background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)' } }, t('SaveChanges'))))),
            react_1["default"].createElement("div", { className: "4xl:max-w-185.5 w-full 5xl:max-w-full" },
                react_1["default"].createElement("div", { className: "border-[#65656526] border dark:border-transparent dark:bg-[#1E1E2080] rounded-[20px] py-6 px-2.5" },
                    react_1["default"].createElement("div", { className: "pb-9" },
                        react_1["default"].createElement("h2", { className: "text-[22px] text-[#656565] dark:text-white font-ui font-bold px-4.5" }, t('ResidencyInformation'))),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-10 px-4.5" },
                        react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                            react_1["default"].createElement("label", { className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" },
                                t('AddressLine'),
                                " 1"),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-11.5 w-full rounded-[9px]" })),
                        react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                            react_1["default"].createElement("label", { className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" },
                                t('AddressLine'),
                                " 2"),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-11.5 w-full rounded-[9px]" })),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                                react_1["default"].createElement("label", { className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" }, t('City')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-11.5 w-full rounded-[9px]" })),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                                react_1["default"].createElement("label", { className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" }, t('Province')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-11.5 w-full rounded-[9px]" }))),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3" },
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                                react_1["default"].createElement("label", { className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" }, t('Country')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-11.5 w-full rounded-[9px]" })),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                                react_1["default"].createElement("label", { className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" }, t('Post/ZipCode')),
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-11.5 w-full rounded-[9px]" }))),
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3" },
                            react_1["default"].createElement("button", { type: "button", disabled: true, className: "h-12 rounded-[20px] bg-[#FFFFFF1A] text-[#656565A6] dark:text-white border dark:border-[#FFFFFF4D] border-[#65656526] flex items-center justify-center text-[15.15px] font-alt font-normal disabled:opacity-60 cursor-not-allowed" }, t('SaveChanges'))))))));
    }
    return (react_1["default"].createElement("div", { className: "grid grid-cols-1 xl:grid-cols-2 4xl:flex 5xl:grid gap-2" },
        react_1["default"].createElement("div", { className: "4xl:max-w-202.75 w-full 5xl:max-w-full" },
            react_1["default"].createElement("div", { className: "dark:bg-[#FFFFFF05] glassShadowDark  bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059] rounded-[20px] glass-shadow py-6 px-2.5" },
                react_1["default"].createElement("div", { className: "pb-6" },
                    react_1["default"].createElement("h2", { className: "text-[22px] text-[#656565] dark:text-white font-ui font-bold px-4.5" }, t('PersonalDetails'))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-5 pb-5 lg:gap-y-5 lg:gap-x-3 lg:grid-cols-2" },
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                        react_1["default"].createElement("label", { htmlFor: "profile-first-name", className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('FirstName')),
                        react_1["default"].createElement("div", { className: "flex gap-6 items-center bg-[#FFFFFF] dark:bg-[#1E1E2080] text-lg h-[61px] border border-[#65656526] dark:border-transparent rounded-md font-alt font-normal pt-2.5 pb-2 px-4.5" },
                            react_1["default"].createElement("input", { id: "profile-first-name", type: "text", placeholder: t('EnterFirstName'), value: firstName, onChange: function (e) { return setFirstName(e.target.value); }, className: "placeholder:text-[#656565A6] truncate w-full dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none text-black dark:text-white " }))),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                        react_1["default"].createElement("label", { htmlFor: "profile-last-name", className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('LastName')),
                        react_1["default"].createElement("div", { className: "flex gap-6 items-center bg-[#FFFFFF] dark:bg-[#1E1E2080] text-lg h-[61px] border border-[#65656526] dark:border-transparent rounded-md font-alt font-normal pt-2.5 pb-2 px-4.5" },
                            react_1["default"].createElement("input", { id: "profile-last-name", type: "text", placeholder: t('EnterLastName'), value: lastName, onChange: function (e) { return setLastName(e.target.value); }, className: "placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none " }))),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
                        react_1["default"].createElement("label", { htmlFor: "profile-dob", className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('DateofBirth')),
                        react_1["default"].createElement("div", { className: "flex gap-6 items-center bg-[#FFFFFF] dark:bg-[#1E1E2080] text-lg h-[61px] border border-[#65656526] dark:border-transparent rounded-md font-alt font-normal pt-2.5 pb-2 px-4.5 " + (personalErrors.dateOfBirth ? 'ring-2 ring-red-500' : '') },
                            react_1["default"].createElement("input", { id: "profile-dob", type: "text", inputMode: "numeric", autoComplete: "bday", placeholder: "MM/DD/YYYY", maxLength: 10, value: dateOfBirth, onChange: function (e) {
                                    var formatted = formatDateOfBirthInput(e.target.value);
                                    setDateOfBirth(formatted);
                                    if (personalErrors.dateOfBirth)
                                        setPersonalErrors(function (p) { return (__assign(__assign({}, p), { dateOfBirth: '' })); });
                                }, className: "placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none  text-black dark:text-white" })),
                        personalErrors.dateOfBirth && (react_1["default"].createElement("p", { className: "pl-3.5 text-sm text-red-500 font-ui" }, personalErrors.dateOfBirth))),
                    react_1["default"].createElement(PhoneInput_1.PhoneInput, { height: 'h-[61px]', value: phone, onChange: setPhone, userCountry: user === null || user === void 0 ? void 0 : user.country })),
                react_1["default"].createElement("div", { className: "flex flex-col pb-6.75 gap-2.5" },
                    react_1["default"].createElement("label", { htmlFor: "profile-email", className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('EmailAddress')),
                    react_1["default"].createElement("div", { className: "flex gap-6  border border-[#65656526] dark:border-transparent items-center bg-[#FFFFFF] dark:bg-[#1E1E2080] text-lg h-15.25 rounded-md font-alt font-normal pt-2.5 pb-2 px-4.5" },
                        react_1["default"].createElement("input", { id: "profile-email", type: "text", placeholder: t('Enter Email Address'), value: email, readOnly: true, className: "placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFF66] outline-none bg-transparent border-none text-[#656565A6] dark:text-[#FFFFFFA6]" }))),
                react_1["default"].createElement("button", { type: "button", onClick: handleSavePersonal, disabled: saveLoading, className: "\n                  flex items-center justify-center\n                  h-15.25  rounded-xl w-full\n                  font-semibold font-ui text-[22px]\n                  text-black\n                  hover:brightness-110\n                  hover:shadow-lg\n                  transition-all duration-200\n                  disabled:opacity-60\n                ", style: {
                        background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)'
                    } }, saveLoading ? react_1["default"].createElement(Loader_1.Loader, { className: "h-6 w-6 text-white", ariaLabel: "Saving profile" }) : t('SaveChanges'))),
            react_1["default"].createElement("div", { className: "border-[#65656526] mt-3 border dark:border-[#40404059] dark:bg-[#FFFFFF05]  bg-[#F1F1FE]  rounded-[20px]  py-6 px-2.5" },
                react_1["default"].createElement("div", { className: "pb-6" },
                    react_1["default"].createElement("h2", { className: "text-[22px] font-ui font-bold text-[#656565] dark:text-white px-4.5" }, t('ReceivingWallet'))),
                react_1["default"].createElement("div", { className: "flex flex-col pb-6 gap-2.5" },
                    react_1["default"].createElement("label", { htmlFor: "profile-wallet", className: "pl-3.5 text-[22px] font-bold font-ui text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('WalletAddress')),
                    react_1["default"].createElement("div", { className: "bg-[#FFFFFF] overflow-hidden dark:bg-[#1E1E2080] h-[61px] border border-[#65656526] dark:border-transparent pl-4.5 pr-3.75 pt-2.5 pb-2 justify-between rounded-md flex items-center text-[15px] sm:text-lg font-light font-ui text-[#656565A6] dark:text-white gap-2 " + (walletErrors.walletAddress ? 'ring-2 ring-red-500' : '') },
                        react_1["default"].createElement("input", { id: "profile-wallet", type: "text", placeholder: typeof network === 'object' &&
                                typeof currency === 'object' &&
                                network.label !== 'Select Network' &&
                                currency.label !== 'Select Currency'
                                ? "Enter " + network.label + " address (" + currency.label + ")"
                                : typeof network === 'object' && network.label !== 'Select Network'
                                    ? "Enter " + network.label + " address"
                                    : typeof currency === 'object' && currency.label !== 'Select Currency'
                                        ? "Enter wallet address (" + currency.label + ")"
                                        : 'Enter wallet address (select Network and Currency)', value: walletAddress, onChange: function (e) {
                                setWalletAddress(e.target.value);
                                if (walletErrors.walletAddress)
                                    setWalletErrors(function (w) { return (__assign(__assign({}, w), { walletAddress: '' })); });
                            }, className: "flex-1 min-w-0 bg-transparent border-none outline-none placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFF66] truncate" }),
                        react_1["default"].createElement("button", { type: "button", onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                                var text, err_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, navigator.clipboard.readText()];
                                        case 1:
                                            text = _a.sent();
                                            setWalletAddress(text);
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_1 = _a.sent();
                                            console.error('Failed to read clipboard: ', err_1);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }, className: "\n      px-5 h-8.5 flex glassCard2 gap-3.5 items-center shrink-0\n      border border-[#65656526] dark:border-[#FFFFFF4D] rounded-lg\n      bg-[#6565651A] dark:bg-[#FFFFFF1A]\n      text-base font-ui font-normal text-[#656565] dark:text-white\n      hover:bg-[#FFFFFF33] dark:hover:bg-white/20\n      hover:border-white\n      transition-all duration-200\n    " },
                            t('Paste'),
                            react_1["default"].createElement(image_1["default"], { width: 16, height: 16, priority: true, className: "dark:block hidden", src: "/assets/solar_copy-outline.svg", alt: "Copy Icon" }),
                            react_1["default"].createElement(image_1["default"], { width: 16, height: 16, priority: true, className: "dark:hidden ", src: "/assets/solar_copy-outline_light.svg", alt: "Copy Icon" }))),
                    walletErrors.walletAddress && (react_1["default"].createElement("p", { className: "pl-3.5 text-sm text-red-500 font-ui" }, walletErrors.walletAddress))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-2" },
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2.5 relative" },
                        react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('Network')),
                        react_1["default"].createElement("div", { onClick: function () {
                                setNetworkOpen(!networkOpen);
                                if (walletErrors.network)
                                    setWalletErrors(function (w) { return (__assign(__assign({}, w), { network: '' })); });
                            }, className: "flex cursor-pointer h-15.25 text-[#656565A6] dark:text-white justify-between items-center bg-[#FFFFFF] border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] text-lg rounded-md pt-2.5 pb-2 pl-4.5 pr-3.75 " + (walletErrors.network ? 'ring-2 ring-red-500' : '') },
                            react_1["default"].createElement("div", { className: "flex gap-6 items-center" },
                                network === 'Select Network' ? ('') : (react_1["default"].createElement("button", { className: "relative w-11 h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md" },
                                    react_1["default"].createElement(image_1["default"], { width: 24, height: 24, src: typeof network === 'object'
                                            ? network.icon
                                            : network !== 'Select Network'
                                                ? ((_b = (_a = allNetworks.find(function (n) { return n.label === network; })) === null || _a === void 0 ? void 0 : _a.icon) !== null && _b !== void 0 ? _b : '')
                                                : '', className: "w-6 h-6", alt: "" }))),
                                react_1["default"].createElement("span", null, typeof network === 'string' ? network : network.label)),
                            react_1["default"].createElement(arrowDown_1["default"], { color: "#FFFFFF59" })),
                        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, networkOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "network-dropdown", ref: networkRef, initial: { opacity: 0, scaleY: 0.95 }, animate: { opacity: 1, scaleY: 1 }, exit: { opacity: 0, scaleY: 0.95 }, transition: { duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }, style: { transformOrigin: networkUp ? 'bottom' : 'top' }, className: "absolute w-full text-[#656565A6] dark:text-white bg-[#F1F1FE] dark:bg-[#272727] rounded-md overflow-hidden z-10 " + (networkUp ? 'bottom-full  ' : 'top-full  ') }, allNetworks.map(function (item) { return (react_1["default"].createElement("div", { key: item.label, onClick: function () {
                                var _a;
                                setNetwork(item);
                                setNetworkOpen(false);
                                setWalletErrors(function (w) { return (__assign(__assign({}, w), { walletAddress: '' })); });
                                var validCurrencies = getCurrenciesForNetwork(item.label);
                                var currentCur = typeof currency === 'object' ? currency === null || currency === void 0 ? void 0 : currency.label : currency;
                                if (currentCur !== 'Select Currency' && currentCur && !validCurrencies.some(function (c) { return c.label === currentCur; })) {
                                    setCurrency((_a = validCurrencies[0]) !== null && _a !== void 0 ? _a : 'Select Currency');
                                }
                            }, className: "px-4 flex gap-4 items-center py-2 hover:text-white bg-white dark:bg-[#1E1E20] hover:bg-[#272727] cursor-pointer" },
                            react_1["default"].createElement("button", { className: "relative max-w-11.5 w-full h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md" },
                                react_1["default"].createElement(image_1["default"], { width: 24, height: 24, src: item.icon, className: "w-6 h-6", alt: item.label })),
                            item.label)); })))),
                        walletErrors.network && react_1["default"].createElement("p", { className: "pl-3.5 text-sm text-red-500 font-ui" }, walletErrors.network)),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2.5 relative" },
                        react_1["default"].createElement("label", { className: "pl-3.5 text-[22px] font-bold text-[#656565A6] dark:text-[#FFFFFFA6]" }, t('PayoutCurrency')),
                        react_1["default"].createElement("div", { onClick: function () {
                                setCurrencyOpen(!currencyOpen);
                                if (walletErrors.currency)
                                    setWalletErrors(function (w) { return (__assign(__assign({}, w), { currency: '' })); });
                            }, className: "flex text-[#656565A6] dark:text-white h-15.25 cursor-pointer justify-between items-center bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] text-lg rounded-md pt-2.5 pb-2 pl-4.5 pr-3.75 " + (walletErrors.currency ? 'ring-2 ring-red-500' : '') },
                            react_1["default"].createElement("div", { className: "flex gap-2 items-center" },
                                currency === 'Select Currency' ? ('') : (react_1["default"].createElement("button", { className: "relative w-11 h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md" },
                                    react_1["default"].createElement(image_1["default"], { width: 24, height: 24, src: typeof currency === 'object'
                                            ? currency.icon
                                            : currency !== 'Select Currency'
                                                ? ((_d = (_c = allCurrencies.find(function (c) { return c.label === currency; })) === null || _c === void 0 ? void 0 : _c.icon) !== null && _d !== void 0 ? _d : '')
                                                : '', className: "w-6 h-6", alt: "" }))),
                                react_1["default"].createElement("div", { className: "flex gap-6 items-center" },
                                    react_1["default"].createElement("span", null, typeof currency === 'string' ? currency : currency.label))),
                            react_1["default"].createElement(arrowDown_1["default"], { color: "#FFFFFF59" })),
                        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, currencyOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { key: "currency-dropdown", ref: currencyRef, initial: { opacity: 0, scaleY: 0.95 }, animate: { opacity: 1, scaleY: 1 }, exit: { opacity: 0, scaleY: 0.95 }, transition: { duration: 0.3, ease: [0.25, 0.8, 0.25, 1] }, style: { transformOrigin: currencyUp ? 'bottom' : 'top' }, className: "absolute w-full text-[#656565A6] dark:text-white bg-[#F1F1FE] dark:bg-[#272727] rounded-md overflow-hidden z-10 " + (currencyUp ? 'bottom-full  ' : 'top-full ') }, currenciesToShow.map(function (item) { return (react_1["default"].createElement("div", { key: item.label, onClick: function () {
                                var _a;
                                setCurrency(item);
                                setCurrencyOpen(false);
                                var validNetworks = getNetworksForCurrency(item.label);
                                var currentNet = typeof network === 'object' ? network === null || network === void 0 ? void 0 : network.label : network;
                                if (currentNet !== 'Select Network' && currentNet && !validNetworks.some(function (n) { return n.label === currentNet; })) {
                                    setNetwork((_a = validNetworks[0]) !== null && _a !== void 0 ? _a : 'Select Network');
                                }
                            }, className: "px-4 flex gap-4 items-center py-2  hover:text-white dark:bg-[#1E1E20] hover:bg-[#272727] cursor-pointer" },
                            react_1["default"].createElement("button", { className: "relative max-w-11.5 w-full h-10.75 flex items-center gap-1.75 justify-center bg-white dark:bg-[#272727] rounded-md" },
                                react_1["default"].createElement(image_1["default"], { width: 24, height: 24, src: item.icon, className: "w-6 h-6", alt: item.label })),
                            item.label)); })))),
                        walletErrors.currency && react_1["default"].createElement("p", { className: "pl-3.5 text-sm text-red-500 font-ui" }, walletErrors.currency))),
                react_1["default"].createElement("button", { type: "button", onClick: handleSaveWallet, disabled: walletSaveLoading, className: "\n              flex items-center justify-center\n              h-15.25  rounded-xl mt-6 w-full\n              font-semibold font-ui text-[22px]\n              text-black\n              hover:brightness-110\n              hover:shadow-lg\n              transition-all duration-200\n              disabled:opacity-60\n            ", style: {
                        background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)'
                    } }, walletSaveLoading ? react_1["default"].createElement(Loader_1.Loader, { className: "h-6 w-6 text-white", ariaLabel: "Saving wallet" }) : t('SaveChanges')))),
        react_1["default"].createElement("div", { className: "4xl:max-w-185.5   w-full 5xl:max-w-full" },
            react_1["default"].createElement("div", { className: "border-[#65656526] border dark:border-[#40404059] bg-[#F1F1FE] dark:bg-[#FFFFFF05] rounded-[20px]  py-6 px-2.5 lg:px-4.5" },
                react_1["default"].createElement("div", { className: "pb-9" },
                    react_1["default"].createElement("h2", { className: "text-[22px] text-[#656565] dark:text-white font-ui font-bold px-4.5" }, t('ResidencyInformation'))),
                react_1["default"].createElement("div", { className: "flex flex-col gap-10" },
                    react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                        react_1["default"].createElement("label", { htmlFor: "profile-address1", className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" },
                            t('AddressLine'),
                            " 1 ",
                            react_1["default"].createElement("span", { className: "text-[#53A7FF] text-lg" }, "*")),
                        react_1["default"].createElement("input", { id: "profile-address1", type: "text", value: addressLine1, onChange: function (e) {
                                setAddressLine1(e.target.value);
                                if (residencyErrors.addressLine1)
                                    setResidencyErrors(function (r) { return (__assign(__assign({}, r), { addressLine1: '' })); });
                            }, className: "bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] px-4.75 h-11.5 rounded-[9px] border-none outline-none placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFFA6] text-black dark:text-white " + (residencyErrors.addressLine1 ? 'ring-2 ring-red-500' : ''), placeholder: t('Enter Address Line 1') }),
                        residencyErrors.addressLine1 && (react_1["default"].createElement("p", { className: "text-sm text-red-500 font-ui" }, residencyErrors.addressLine1))),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                        react_1["default"].createElement("label", { htmlFor: "profile-address2", className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" },
                            t('AddressLine'),
                            " 2"),
                        react_1["default"].createElement("input", { id: "profile-address2", type: "text", value: addressLine2, onChange: function (e) { return setAddressLine2(e.target.value); }, className: "bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] px-4.75 h-11.5 rounded-[9px] border-none outline-none  placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFFA6] text-black dark:text-white", placeholder: t('Enter Address Line 2') })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                            react_1["default"].createElement("label", { htmlFor: "profile-city", className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" },
                                t('City'),
                                " ",
                                react_1["default"].createElement("span", { className: "text-[#53A7FF] text-lg" }, "*")),
                            react_1["default"].createElement("input", { id: "profile-city", type: "text", value: city, onChange: function (e) {
                                    setCity(e.target.value);
                                    if (residencyErrors.city)
                                        setResidencyErrors(function (r) { return (__assign(__assign({}, r), { city: '' })); });
                                }, className: "bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] px-4.75 h-11.5 rounded-[9px] border-none outline-none placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFFA6] text-black dark:text-white " + (residencyErrors.city ? 'ring-2 ring-red-500' : ''), placeholder: t('EnterCity') }),
                            residencyErrors.city && react_1["default"].createElement("p", { className: "text-sm text-red-500 font-ui" }, residencyErrors.city)),
                        react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                            react_1["default"].createElement("label", { htmlFor: "profile-province", className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" }, t('Province')),
                            react_1["default"].createElement("input", { id: "profile-province", type: "text", value: province, onChange: function (e) {
                                    setProvince(e.target.value);
                                    if (residencyErrors.province)
                                        setResidencyErrors(function (r) { return (__assign(__assign({}, r), { province: '' })); });
                                }, className: "bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] px-4.75 h-11.5 rounded-[9px] border-none outline-none placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFFA6] text-black dark:text-white " + (residencyErrors.province ? 'ring-2 ring-red-500' : ''), placeholder: t('EnterProvince') }),
                            residencyErrors.province && react_1["default"].createElement("p", { className: "text-sm text-red-500 font-ui" }, residencyErrors.province))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3" },
                        react_1["default"].createElement(CountryDropdown_1.CountryDropdown, { profile: true, countryList: countryList }),
                        react_1["default"].createElement("div", { className: "flex flex-col gap-3" },
                            react_1["default"].createElement("label", { htmlFor: "profile-postcode", className: "text-[#656565A6] dark:text-[#FFFFFFA6] text-lg font-bold font-ui" },
                                t('Post/ZipCode'),
                                " ",
                                react_1["default"].createElement("span", { className: "text-[#53A7FF] text-lg" }, "*")),
                            react_1["default"].createElement("input", { id: "profile-postcode", type: "text", value: postCode, onChange: function (e) {
                                    setPostCode(e.target.value);
                                    if (residencyErrors.postCode)
                                        setResidencyErrors(function (r) { return (__assign(__assign({}, r), { postCode: '' })); });
                                }, className: "bg-white border border-[#65656526] dark:border-transparent dark:bg-[#1E1E2080] px-4.75 h-11.5 rounded-[9px] border-none outline-none placeholder:text-[#656565A6] w-full dark:placeholder:text-[#FFFFFFA6] text-black dark:text-white " + (residencyErrors.postCode ? 'ring-2 ring-red-500' : ''), placeholder: t('EnterPostZipCode') }),
                            residencyErrors.postCode && react_1["default"].createElement("p", { className: "text-sm text-red-500 font-ui" }, residencyErrors.postCode))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3" },
                        react_1["default"].createElement("button", { type: "button", onClick: handleSaveResidency, disabled: residencySaveLoading, style: {
                                background: 'linear-gradient(180deg, #F5FF1E 0%, #42DE33 100%)'
                            }, className: "h-12 rounded-xl    text-black  flex items-center justify-center text-[22px] font-alt font-semibold disabled:opacity-60" }, residencySaveLoading ? (react_1["default"].createElement(Loader_1.Loader, { className: "h-6 w-6 text-white", ariaLabel: "Saving residency" })) : (t('SaveChanges')))))))));
};
