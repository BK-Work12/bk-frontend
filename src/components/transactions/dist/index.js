'use client';
"use strict";
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TransactionsIndex = void 0;
var react_1 = require("react");
var arrowDown_1 = require("../icons/arrowDown");
var image_1 = require("next/image");
var auth_1 = require("@/lib/auth");
var api_1 = require("@/lib/api");
var formatUtils_1 = require("@/lib/formatUtils");
var Loader_1 = require("../ui/Loader");
var skeleton_1 = require("../ui/skeleton");
var framer_motion_1 = require("framer-motion");
var react_i18next_1 = require("react-i18next");
function formatUsd(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
function matchSearch(tx, query) {
    if (!query.trim())
        return true;
    var q = query.toLowerCase().trim();
    var searchable = [tx.id, tx.dateTime, tx.product, tx.period, tx.type, tx.status, tx.amount, tx.currency]
        .join(' ')
        .toLowerCase();
    return searchable.includes(q);
}
exports.TransactionsIndex = function (_a) {
    var _b = _a === void 0 ? {} : _a, displayLimit = _b.displayLimit, onFilteredCount = _b.onFilteredCount, onLoadMore = _b.onLoadMore;
    var t = react_i18next_1.useTranslation().t;
    var _c = react_1.useState(''), searchQuery = _c[0], setSearchQuery = _c[1];
    var _d = react_1.useState(t('All')), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState(t('All')), typeFilter = _e[0], setTypeFilter = _e[1];
    var _f = react_1.useState(null), dateFrom = _f[0], setDateFrom = _f[1];
    var _g = react_1.useState(null), dateTo = _g[0], setDateTo = _g[1];
    var _h = react_1.useState(false), filterOpen = _h[0], setFilterOpen = _h[1];
    var _j = react_1.useState(false), datePickerOpen = _j[0], setDatePickerOpen = _j[1];
    var _k = react_1.useState([]), transactions = _k[0], setTransactions = _k[1];
    var _l = react_1.useState(true), loading = _l[0], setLoading = _l[1];
    var _m = react_1.useState(0), totalCompletedInvestments = _m[0], setTotalCompletedInvestments = _m[1];
    var _o = react_1.useState(0), totalCompletedPayouts = _o[0], setTotalCompletedPayouts = _o[1];
    var filterRefDesktop = react_1.useRef(null);
    var filterRefMobile = react_1.useRef(null);
    var datePickerRefDesktop = react_1.useRef(null);
    var datePickerRefMobile = react_1.useRef(null);
    function investmentStatusToDisplay(raw) {
        var s = (raw !== null && raw !== void 0 ? raw : '').toLowerCase();
        if (['open', 'closing', 'finished', 'confirmed'].includes(s))
            return t('COMPLETED');
        if (['waiting', 'confirming', 'sending'].includes(s))
            return t('PENDING');
        if (['failed', 'expired', 'refunded'].includes(s))
            return t('CANCELED');
        return t('PENDING');
    }
    var STATUS_OPTIONS = [t('All'), t('COMPLETED'), t('PENDING'), t('CANCELED')];
    var TYPE_OPTIONS = [t('All'), t('Purchase'), t('Payout')];
    function investmentToTransaction(inv) {
        var _a, _b;
        return {
            id: inv.id,
            dateTime: formatUtils_1.formatIsoToDisplay(inv.createdAt),
            product: inv.product,
            period: inv.period,
            type: t('Purchase'),
            status: investmentStatusToDisplay(inv.status),
            amount: formatUsd(inv.amount),
            currency: (_b = (_a = inv.payCurrency) !== null && _a !== void 0 ? _a : inv.currency) !== null && _b !== void 0 ? _b : 'USD',
            txHash: '—'
        };
    }
    function withdrawalToTransaction(w) {
        var status = w.status === 'completed' ? t('COMPLETED') : w.status === 'pending' ? t('PENDING') : t('CANCELED');
        return {
            id: w.id,
            dateTime: formatUtils_1.formatIsoToDisplay(w.createdAt),
            product: 'Withdrawal',
            period: '—',
            type: t('Payout'),
            status: status,
            amount: formatUsd(w.amount),
            currency: w.payCurrency || 'USDC',
            txHash: '—'
        };
    }
    react_1.useEffect(function () {
        var load = function () { return __awaiter(void 0, void 0, void 0, function () {
            var token, _a, investmentsRes, withdrawals, investments, invTotal, invTx, wdTx, orderList, payoutTotal;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        token = auth_1.getToken();
                        return [4 /*yield*/, Promise.all([api_1.getInvestments(token), api_1.getWithdrawals(token)])];
                    case 1:
                        _a = _b.sent(), investmentsRes = _a[0], withdrawals = _a[1];
                        investments = investmentsRes.list, invTotal = investmentsRes.totalCompletedInvestments;
                        invTx = investments.map(investmentToTransaction);
                        wdTx = withdrawals.map(withdrawalToTransaction);
                        orderList = __spreadArrays(invTx, wdTx).sort(function (a, b) {
                            var da = formatUtils_1.parseDotDate(a.dateTime).getTime();
                            var db = formatUtils_1.parseDotDate(b.dateTime).getTime();
                            return db - da;
                        });
                        setTransactions(orderList);
                        setTotalCompletedInvestments(invTotal);
                        payoutTotal = withdrawals
                            .filter(function (w) { return w.status === 'completed'; })
                            .reduce(function (sum, w) { var _a; return sum + ((_a = w.amount) !== null && _a !== void 0 ? _a : 0); }, 0);
                        setTotalCompletedPayouts(payoutTotal);
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        load();
    }, []);
    var filteredTransactions = react_1.useMemo(function () {
        return transactions.filter(function (tx) {
            if (!matchSearch(tx, searchQuery))
                return false;
            if (statusFilter !== 'All' && tx.status !== statusFilter)
                return false;
            if (typeFilter !== 'All' && tx.type !== typeFilter)
                return false;
            var txDate = formatUtils_1.parseDotDate(tx.dateTime);
            if (dateFrom) {
                var from = new Date(dateFrom + 'T00:00:00');
                if (txDate < from)
                    return false;
            }
            if (dateTo) {
                var to = new Date(dateTo + 'T23:59:59.999');
                if (txDate > to)
                    return false;
            }
            return true;
        });
    }, [transactions, searchQuery, statusFilter, typeFilter, dateFrom, dateTo]);
    var displayedTransactions = displayLimit != null && Number.isFinite(displayLimit)
        ? filteredTransactions.slice(0, displayLimit)
        : filteredTransactions;
    react_1.useEffect(function () {
        onFilteredCount === null || onFilteredCount === void 0 ? void 0 : onFilteredCount(filteredTransactions.length);
    }, [filteredTransactions.length, onFilteredCount]);
    react_1.useEffect(function () {
        var handleClickOutside = function (e) {
            var _a, _b;
            var target = e.target;
            if (!((_a = filterRefDesktop.current) === null || _a === void 0 ? void 0 : _a.contains(target)) && !((_b = filterRefMobile.current) === null || _b === void 0 ? void 0 : _b.contains(target)))
                setFilterOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return function () { return document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    react_1.useEffect(function () {
        var handleClickOutside = function (e) {
            var _a, _b;
            var target = e.target;
            var outsideDesktop = !((_a = datePickerRefDesktop.current) === null || _a === void 0 ? void 0 : _a.contains(target));
            var outsideMobile = !((_b = datePickerRefMobile.current) === null || _b === void 0 ? void 0 : _b.contains(target));
            if (outsideDesktop && outsideMobile)
                setDatePickerOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return function () { return document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    var activeFilterCount = [
        statusFilter !== t('All'),
        typeFilter !== t('All'),
        dateFrom !== null,
        dateTo !== null,
    ].filter(Boolean).length;
    var dateRangeLabel = formatUtils_1.formatDateRangeLabel(dateFrom, dateTo);
    return (react_1["default"].createElement("div", { className: "flex flex-col gap-2.5" },
        react_1["default"].createElement("div", { className: "grid grid-cols-1 xl:grid-cols-2 gap-2.5" },
            react_1["default"].createElement("div", { className: "relative border dark:border-[#40404059] rounded-[20px] flex flex-col gap-[35px] lg:gap-18 bg-[#F1F1FE] dark:bg-[#FFFFFF0A]  py-5.5 px-5" },
                react_1["default"].createElement(image_1["default"], { width: 1000, height: 1000, priority: true, src: "/assets/Group 1597884944.png", className: "max-w-full h-auto absolute left-[50%] -translate-x-1/2 top-0 z-0", alt: "" }),
                react_1["default"].createElement("div", { className: "flex justify-between items-start" },
                    react_1["default"].createElement(image_1["default"], { width: 72, height: 72, priority: true, src: "/assets/Crypto-Transaction-Monitor--Streamline-Ultimate.png", alt: "" }),
                    react_1["default"].createElement("button", { className: " dark:block" },
                        react_1["default"].createElement(image_1["default"], { width: 18, height: 20, priority: true, src: "/assets/share.png", alt: "" }))),
                react_1["default"].createElement("div", { className: "flex relative flex-col lg:flex-row justify-between max-lg:gap-2.5 items-start lg:items-end" },
                    react_1["default"].createElement("h2", { className: "text-[22px] font-bold font-ui text-[#656565] dark:text-white" }, t('TotalCompletedInvestments')),
                    react_1["default"].createElement("div", { className: "px-4.75 dark:bg-[#FFFFFF0A] max-lg:w-full bg-[#FFFFFF] border border-[#65656526] dark:border-transparent  flex lg:justify-center items-center border dark:border-[#FFFFFF4D] numberShadow  h-19.75 leading-[0] text-[52px] font-bold font-display rounded-[20px]" }, loading ? (react_1["default"].createElement(Loader_1.Loader, { className: "h-8 w-8 sm:h-10 sm:w-10 text-[#656565] dark:text-white", ariaLabel: "Loading investments" })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("span", { className: "max-sm:text-[52px] text-[35px] hidden dark:block 2xl:text-[52px] text-[#656565] dark:text-white font-bold leading-none -translate-y-[5px] " }, formatUsd(totalCompletedInvestments)),
                        react_1["default"].createElement("span", { className: "max-sm:text-[52px] text-[35px] dark:hidden 2xl:text-[52px] text-[#656565] dark:text-white font-bold leading-none -translate-y-[5px] " }, (function () {
                            var s = formatUsd(totalCompletedInvestments);
                            var i = s.lastIndexOf('.');
                            if (i === -1)
                                return s;
                            return (react_1["default"].createElement(react_1["default"].Fragment, null,
                                s.slice(0, i + 1),
                                react_1["default"].createElement("span", { className: "text-[#00000066]" }, s.slice(i + 1))));
                        })())))))),
            react_1["default"].createElement("div", { className: "relative border dark:border-[#40404059] rounded-[20px] flex flex-col gap-[35px] lg:gap-18 bg-[#F1F1FE] dark:bg-[#FFFFFF0A]  py-5.5 px-5" },
                react_1["default"].createElement(image_1["default"], { width: 1000, height: 1000, priority: true, src: "/assets/Group 1597884945.png", className: "max-w-full h-auto absolute left-[50%] -translate-x-1/2 top-0 z-0", alt: "" }),
                react_1["default"].createElement("div", { className: "flex justify-between relative items-start" },
                    react_1["default"].createElement(image_1["default"], { width: 72, height: 72, priority: true, src: "/assets/Crypto-Transaction-Phone-Receive--Streamline-Ultimate.png", alt: "" }),
                    react_1["default"].createElement("button", { className: "" },
                        react_1["default"].createElement(image_1["default"], { width: 18, height: 20, priority: true, src: "/assets/share.png", alt: "" }))),
                react_1["default"].createElement("div", { className: "flex relative flex-col lg:flex-row justify-between max-lg:gap-2.5 items-start lg:items-end" },
                    react_1["default"].createElement("h2", { className: "text-[22px] font-bold font-ui text-[#656565] dark:text-white" }, t('TotalCompletedPayouts')),
                    react_1["default"].createElement("div", { className: "px-4.75 dark:bg-[#FFFFFF0A] max-lg:w-full bg-[#FFFFFF] border border-[#65656526] dark:border-transparent  flex lg:justify-center items-center border dark:border-[#FFFFFF4D] numberShadow  h-19.75 leading-[0] text-[52px] font-bold font-display rounded-[20px]" }, loading ? (react_1["default"].createElement(Loader_1.Loader, { className: "h-8 w-8 sm:h-10 sm:w-10 text-[#656565] dark:text-white", ariaLabel: "Loading payouts" })) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("span", { className: "max-sm:text-[52px] text-[35px] hidden dark:block 2xl:text-[52px] text-[#656565] dark:text-white font-bold leading-none -translate-y-[5px] " }, formatUsd(totalCompletedPayouts)),
                        react_1["default"].createElement("span", { className: "max-sm:text-[52px] text-[35px] dark:hidden 2xl:text-[52px] text-[#656565] dark:text-white font-bold leading-none -translate-y-[5px] " }, (function () {
                            var s = formatUsd(totalCompletedPayouts);
                            var i = s.lastIndexOf('.');
                            if (i === -1)
                                return s;
                            return (react_1["default"].createElement(react_1["default"].Fragment, null,
                                s.slice(0, i + 1),
                                react_1["default"].createElement("span", { className: "text-[#00000066]" }, s.slice(i + 1))));
                        })()))))))),
        react_1["default"].createElement("div", { className: "rounded-2xl dark:bg-[#FFFFFF0A] bg-[#F1F1FE] border border-[#65656526] dark:border-[#40404059]  px-1 pb-1 pt-4.25" },
            react_1["default"].createElement("div", { className: "flex justify-between px-5 pb-3 items-center" },
                react_1["default"].createElement("div", { className: "flex shrink-0 items-center gap-2" },
                    react_1["default"].createElement("h2", { className: "text-[22px] font-bold font-ui  text-[#656565] dark:text-white" }, t('MyTransactions'))),
                react_1["default"].createElement("div", { className: "ml-10 hidden  w-full pl-3.25 pr-5 border-r mr-5 border-l border-[#65656533] dark:border-[#FFFFFF33] lg:flex gap-2.25  items-center" },
                    react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/material-symbols-light_search.png", className: "hidden dark:block", alt: "" }),
                    react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/material-symbols-light_search (2).png", className: " dark:hidden", alt: "" }),
                    react_1["default"].createElement("input", { type: "text", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "dark:placeholder:text-[#FFFFFF80] placeholder:text-[#65656580] text-black dark:text-white outline-none w-full text-base font-normal", placeholder: t('Search') }),
                    react_1["default"].createElement("div", { className: "relative shrink-0", ref: filterRefDesktop },
                        react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/mynaui_filter.png", className: "hidden dark:block", alt: "" }),
                        react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/mynaui_filter (1).png", className: " dark:hidden", alt: "" }),
                        react_1["default"].createElement("button", { type: "button", onClick: function () { return setFilterOpen(function (o) { return !o; }); }, className: "absolute inset-0", "aria-label": "Filter transactions" }),
                        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, filterOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: -10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.95 }, transition: { duration: 0.2, ease: 'easeOut' }, className: "absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-3 px-4", onClick: function (e) { return e.stopPropagation(); } },
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3" }, t('Status')),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 mb-4" }, STATUS_OPTIONS.map(function (s) { return (react_1["default"].createElement("button", { key: s, type: "button", onClick: function () { return setStatusFilter(s); }, className: "px-3 py-1.5 rounded-lg text-xs font-medium border " + (statusFilter === s
                                    ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                                    : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6] hover:border-[#65656566]') }, s)); })),
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3" }, t('Type')),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, TYPE_OPTIONS.map(function (t) { return (react_1["default"].createElement("button", { key: t, type: "button", onClick: function () { return setTypeFilter(t); }, className: "px-3 py-1.5 rounded-lg text-xs font-medium border " + (typeFilter === t
                                    ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                                    : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6] hover:border-[#65656566]') }, t)); })),
                            (statusFilter !== t('All') || typeFilter !== t('All') || dateFrom || dateTo) && (react_1["default"].createElement("button", { type: "button", onClick: function () {
                                    setStatusFilter(t('All'));
                                    setTypeFilter(t('All'));
                                    setDateFrom(null);
                                    setDateTo(null);
                                }, className: "mt-3 w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]" }, t('Clearfilters')))))))),
                react_1["default"].createElement("div", { className: "flex lg:hidden items-center" },
                    react_1["default"].createElement("div", { className: "relative", ref: filterRefMobile },
                        react_1["default"].createElement("button", { type: "button", onClick: function () { return setFilterOpen(function (o) { return !o; }); }, className: "", "aria-label": "Filter" },
                            react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/mynaui_filter.png", className: "hidden dark:block", alt: "" }),
                            react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/mynaui_filter (1).png", className: " dark:hidden", alt: "" })),
                        react_1["default"].createElement(framer_motion_1.AnimatePresence, null, filterOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: -10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.95 }, transition: { duration: 0.2, ease: 'easeOut' }, className: "absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-3 px-4", onClick: function (e) { return e.stopPropagation(); } },
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3" }, t('Status')),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 mb-4" }, STATUS_OPTIONS.map(function (s) { return (react_1["default"].createElement("button", { key: s, type: "button", onClick: function () { return setStatusFilter(s); }, className: "px-3 py-1.5 rounded-lg text-xs font-medium border " + (statusFilter === s
                                    ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                                    : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6]') }, s)); })),
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3" }, t('Type')),
                            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, TYPE_OPTIONS.map(function (t) { return (react_1["default"].createElement("button", { key: t, type: "button", onClick: function () { return setTypeFilter(t); }, className: "px-3 py-1.5 rounded-lg text-xs font-medium border " + (typeFilter === t
                                    ? 'border-[#6B63DF] dark:border-[#8EDD23] bg-[#6B63DF1A] dark:bg-[#8EDD231A] text-[#6B63DF] dark:text-[#8EDD23]'
                                    : 'border-[#65656533] dark:border-[#FFFFFF33] text-[#656565] dark:text-[#FFFFFFA6]') }, t)); })),
                            (statusFilter !== t('All') || typeFilter !== t('All') || dateFrom || dateTo) && (react_1["default"].createElement("button", { type: "button", onClick: function () {
                                    setStatusFilter(t('All'));
                                    setTypeFilter(t('All'));
                                    setDateFrom(null);
                                    setDateTo(null);
                                }, className: "mt-3 w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]" }, t('Clearfilters'))))))),
                    react_1["default"].createElement("div", { ref: datePickerRefMobile, className: "relative ml-5 pl-[15px] border-l border-[#65656533] dark:border-[#FFFFFF33]" },
                        react_1["default"].createElement("button", { type: "button", onClick: function () { return setDatePickerOpen(function (o) { return !o; }); }, className: "min-h-[40px] py-2 px-2.5 text-left flex items-center", "aria-label": "Filter by date" },
                            react_1["default"].createElement("span", { className: "text-base font-normal font-alt dark:text-white text-[#656565] truncate max-w-[140px] sm:max-w-[160px]" }, dateRangeLabel)),
                        datePickerOpen && (react_1["default"].createElement("div", { className: "absolute left-0 top-full mt-2 z-20 w-64 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-4 px-4" },
                            react_1["default"].createElement("p", { className: "text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3" }, t('Daterange')),
                            react_1["default"].createElement("div", { className: "flex flex-col gap-3 mb-3" },
                                react_1["default"].createElement("label", { className: "text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]" },
                                    t('From'),
                                    react_1["default"].createElement("input", { type: "date", value: dateFrom !== null && dateFrom !== void 0 ? dateFrom : '', onChange: function (e) { return setDateFrom(e.target.value || null); }, className: "mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none" })),
                                react_1["default"].createElement("label", { className: "text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]" },
                                    t('To'),
                                    react_1["default"].createElement("input", { type: "date", value: dateTo !== null && dateTo !== void 0 ? dateTo : '', onChange: function (e) { return setDateTo(e.target.value || null); }, className: "mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none" }))),
                            (dateFrom || dateTo) && (react_1["default"].createElement("button", { type: "button", onClick: function () {
                                    setDateFrom(null);
                                    setDateTo(null);
                                }, className: "w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]" }, t('Cleardates'))))))),
                react_1["default"].createElement("div", { ref: datePickerRefDesktop, className: "relative hidden lg:block shrink-0" },
                    react_1["default"].createElement("button", { type: "button", onClick: function () { return setDatePickerOpen(function (o) { return !o; }); }, className: "hidden lg:flex items-center gap-2.5 min-h-[44px] py-2 px-3 min-w-[11rem] max-w-[13rem] rounded-lg border border-transparent hover:bg-[#FFFFFF26] dark:hover:bg-[#FFFFFF0D] transition-colors", "aria-label": "Filter by date range" },
                        react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/proicons_calendar.png", className: "hidden dark:block shrink-0", alt: "" }),
                        react_1["default"].createElement(image_1["default"], { width: 24, height: 24, priority: true, src: "/assets/proicons_calendar (2).png", className: "dark:hidden shrink-0", alt: "" }),
                        react_1["default"].createElement("span", { className: "text-base font-normal font-alt text-[#656565] dark:text-white truncate text-left flex-1 min-w-0" }, dateRangeLabel),
                        react_1["default"].createElement("span", { className: "hidden dark:block shrink-0" },
                            react_1["default"].createElement(image_1["default"], { width: 13, height: 13, src: "/assets/Polygon 2.svg", alt: "" })),
                        react_1["default"].createElement("span", { className: "hidden lg:block dark:hidden shrink-0" },
                            react_1["default"].createElement(arrowDown_1["default"], { color: "#65656559" }))),
                    react_1["default"].createElement(framer_motion_1.AnimatePresence, null, datePickerOpen && (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, y: -10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.95 }, transition: { duration: 0.2, ease: 'easeOut' }, className: "absolute right-0 top-full mt-2 z-20 w-64 rounded-xl border border-[#65656526] dark:border-[#FFFFFF33] bg-white dark:bg-[#323234] shadow-lg py-4 px-4", onClick: function (e) { return e.stopPropagation(); } },
                        react_1["default"].createElement("p", { className: "text-sm font-semibold text-[#656565] dark:text-[#FFFFFF80] mb-3" }, t('Daterange')),
                        react_1["default"].createElement("div", { className: "flex flex-col gap-3 mb-3" },
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]" },
                                t('From'),
                                react_1["default"].createElement("input", { type: "date", value: dateFrom !== null && dateFrom !== void 0 ? dateFrom : '', onChange: function (e) { return setDateFrom(e.target.value || null); }, className: "mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none" })),
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6]" },
                                t('To'),
                                react_1["default"].createElement("input", { type: "date", value: dateTo !== null && dateTo !== void 0 ? dateTo : '', onChange: function (e) { return setDateTo(e.target.value || null); }, className: "mt-1 w-full px-3 py-2 rounded-lg border border-[#65656533] dark:border-[#FFFFFF33] bg-white dark:bg-[#1E1E20] text-[#656565] dark:text-white text-sm outline-none" }))),
                        (dateFrom || dateTo) && (react_1["default"].createElement("button", { type: "button", onClick: function () {
                                setDateFrom(null);
                                setDateTo(null);
                            }, className: "w-full py-2 text-xs font-medium text-[#656565] dark:text-[#FFFFFFA6] hover:text-[#6B63DF] dark:hover:text-[#8EDD23]" }, t('Cleardates')))))))),
            react_1["default"].createElement("div", { className: "dark:bg-[#070707] rounded-xl p-1" },
                react_1["default"].createElement("div", { className: "w-full py-3.5 bg-white border border-[#65656526] dark:border-transparent dark:bg-transparent no-scrollbar px-3 rounded-[9px] overflow-x-auto  " },
                    react_1["default"].createElement("table", { className: "w-full" },
                        react_1["default"].createElement("thead", null,
                            react_1["default"].createElement("tr", { className: "bg-[#F1F1FE] dark:bg-[#121212] rounded-[9px]" }, [
                                t('TransactionID'),
                                t('Date / Time'),
                                t('Bond'),
                                t('Type'),
                                t('Status'),
                                t('Amount'),
                                t('Currency'),
                                t('TXHash'),
                            ].map(function (title, i) { return (react_1["default"].createElement("th", { key: i, className: "px-6 py-2.5  text-base font-semibold \n        text-[#00000080] dark:text-[#FFFFFF80] whitespace-nowrap\n        " + (i === 0 ? 'rounded-l-xl dark:rounded-l-[9px] text-start' : 'text-center') + " \n        " + (i === 7 ? 'rounded-r-xl dark:rounded-r-[9px]' : 'relative') },
                                title,
                                i !== 7 && (react_1["default"].createElement("span", { className: "w-px h-4.25 top-1/2 -translate-y-1/2 \n          bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0" })))); }))),
                        react_1["default"].createElement("tbody", null, loading ? (react_1["default"].createElement(react_1["default"].Fragment, null, [1, 2, 3, 4, 5].map(function (i) { return (react_1["default"].createElement("tr", { key: i, className: "border-b border-[#FFFFFF0D]" },
                            react_1["default"].createElement("td", { className: "px-6 py-4" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-20" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-28 mx-auto" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-24 mx-auto" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-16 mx-auto" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-20 mx-auto rounded-lg" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-16 mx-auto" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-12 mx-auto" })),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-10 mx-auto" })))); }))) : displayedTransactions.length === 0 ? (react_1["default"].createElement("tr", null,
                            react_1["default"].createElement("td", { colSpan: 8, className: "px-6 py-12 text-center text-[#65656580] dark:text-[#FFFFFF80]" }, t('Notransactionsmatch')))) : (displayedTransactions.map(function (tx, index) { return (react_1["default"].createElement("tr", { key: tx.id + "-" + index, className: "border-b border-[#FFFFFF0D]" },
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-lg font-bold text-[#656565] dark:text-[#FFFFFFA6] text-center truncate", title: tx.id }, tx.id),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center truncate text-[#65656580] dark:text-[#FFFFFF80]" }, tx.dateTime),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center text-[#656565] dark:text-white" },
                                react_1["default"].createElement("div", { className: "flex items-center truncate justify-center gap-2" }, tx.product)),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center " + (tx.type === 'Payout' ? 'text-[#8EDD23]' : 'text-[#65656580] dark:text-[#FFFFFF80]') + " " }, tx.type),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center" },
                                react_1["default"].createElement("span", { className: "px-4 py-2 rounded-lg border text-xs font-bold " + (tx.status === 'COMPLETED'
                                        ? 'border-[#8EDD23] text-[#8EDD23]'
                                        : tx.status === 'PENDING'
                                            ? 'border-[#F4B73F] text-[#F4B73F]'
                                            : 'border-[#FF5A5A] text-[#FF5A5A]') }, tx.status)),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center font-bold " + (tx.type === 'Payout' ? 'text-[#8EDD23]' : 'text-[#656565] dark:text-[#FFFFFFA6]') }, tx.amount),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center text-[#65656580] dark:text-[#FFFFFFA6] font-bold" }, tx.currency),
                            react_1["default"].createElement("td", { className: "px-6 py-4 text-center text-[#65656580] dark:text-white cursor-pointer underline" }, tx.txHash))); })))))))));
};
