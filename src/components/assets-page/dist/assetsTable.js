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
exports.__esModule = true;
exports.AssetsTable = void 0;
var react_1 = require("react");
var api_1 = require("@/lib/api");
var auth_1 = require("@/lib/auth");
var react_toastify_1 = require("react-toastify");
var formatUtils_1 = require("@/lib/formatUtils");
var skeleton_1 = require("@/components/ui/skeleton");
var Loader_1 = require("@/components/ui/Loader");
var react_i18next_1 = require("react-i18next");
var navigation_1 = require("next/navigation");
function investmentToRow(item) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var statusNorm = ((_a = item.status) !== null && _a !== void 0 ? _a : '').toUpperCase();
    var completed = ['OPEN', 'CLOSING', 'FINISHED', 'CONFIRMED'].includes(statusNorm);
    var principal = ((_b = item.currency) === null || _b === void 0 ? void 0 : _b.toUpperCase()) === 'USD'
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format((_c = item.amount) !== null && _c !== void 0 ? _c : 0)
        : ((_d = item.amount) !== null && _d !== void 0 ? _d : 0).toFixed(2) + " " + ((_e = item.currency) !== null && _e !== void 0 ? _e : 'USD').toUpperCase();
    return {
        _id: item.id,
        assetId: item.id.length > 12 ? item.id.slice(0, 8) + "\u2026" : item.id,
        dateTime: formatUtils_1.formatIsoToDisplay(item.createdAt),
        product: (_f = item.product) !== null && _f !== void 0 ? _f : '—',
        period: (_g = item.period) !== null && _g !== void 0 ? _g : '—',
        principal: principal,
        maturity: formatUtils_1.formatDateMedium(item.maturityDate),
        status: completed ? 'completed' : 'pending',
        daysLeft: formatUtils_1.daysLeftFromMaturity(item.maturityDate),
        redemptionExpired: formatUtils_1.isRedemptionExpired(item.maturityDate, item.redemption),
        strategyId: item.strategyId,
        amount: (_h = item.amount) !== null && _h !== void 0 ? _h : 0,
        autoReinvest: (_j = item.autoReinvest) !== null && _j !== void 0 ? _j : false
    };
}
exports.AssetsTable = function (_a) {
    var _b = _a.statusFilter, statusFilter = _b === void 0 ? 'All' : _b, _c = _a.dateFrom, dateFrom = _c === void 0 ? null : _c, _d = _a.dateTo, dateTo = _d === void 0 ? null : _d, displayLimit = _a.displayLimit, onFilteredCount = _a.onFilteredCount, handleClick = _a.handleClick;
    var _e = react_1.useState([]), allRows = _e[0], setAllRows = _e[1];
    var _f = react_1.useState(true), loading = _f[0], setLoading = _f[1];
    var _g = react_1.useState(null), reinvestingId = _g[0], setReinvestingId = _g[1];
    var _h = react_1.useState(null), redeemingId = _h[0], setRedeemingId = _h[1];
    var t = react_i18next_1.useTranslation().t;
    var router = navigation_1.useRouter();
    var fetchInvestments = react_1.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var token, list, completedStatuses_1, completedOnly, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = auth_1.getToken();
                    if (!token) {
                        setAllRows([]);
                        setLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, api_1.getInvestments(token)];
                case 2:
                    list = (_a.sent()).list;
                    completedStatuses_1 = ['OPEN', 'CLOSING', 'FINISHED', 'CONFIRMED'];
                    completedOnly = list.filter(function (inv) { var _a; return completedStatuses_1.includes(((_a = inv.status) !== null && _a !== void 0 ? _a : '').toUpperCase()); });
                    setAllRows(completedOnly.map(investmentToRow));
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Failed to fetch investments:', err_1);
                    setAllRows([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    react_1.useEffect(function () {
        fetchInvestments();
    }, [fetchInvestments]);
    var handleReinvest = react_1.useCallback(function (item) { return __awaiter(void 0, void 0, void 0, function () {
        var token, err_2, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (item.autoReinvest)
                        return [2 /*return*/];
                    token = auth_1.getToken();
                    if (!token) {
                        react_toastify_1.toast.error(t('Please log in to enable auto-reinvest'));
                        return [2 /*return*/];
                    }
                    setReinvestingId(item._id);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, api_1.setSubscriptionAutoReinvest(token, item._id)];
                case 2:
                    _a.sent();
                    react_toastify_1.toast.success(t('Auto-reinvest enabled. This investment will be reinvested automatically when the period ends.'));
                    return [4 /*yield*/, fetchInvestments()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_2 = _a.sent();
                    msg = err_2 && typeof err_2 === 'object' && 'message' in err_2 ? String(err_2.message) : 'Failed to enable auto-reinvest';
                    react_toastify_1.toast.error(msg);
                    return [3 /*break*/, 6];
                case 5:
                    setReinvestingId(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [fetchInvestments, t]);
    var handleRedeem = react_1.useCallback(function (item) { return __awaiter(void 0, void 0, void 0, function () {
        var token, err_3, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (item.redemptionExpired)
                        return [2 /*return*/];
                    token = auth_1.getToken();
                    if (!token) {
                        react_toastify_1.toast.error(t('Please log in to redeem'));
                        return [2 /*return*/];
                    }
                    setRedeemingId(item._id);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, api_1.cancelSubscription(token, item._id)];
                case 2:
                    _a.sent();
                    react_toastify_1.toast.success(t('Subscription cancelled. The amount has been returned to your available balance.'));
                    return [4 /*yield*/, fetchInvestments()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    err_3 = _a.sent();
                    msg = err_3 && typeof err_3 === 'object' && 'message' in err_3 ? String(err_3.message) : 'Failed to cancel subscription';
                    react_toastify_1.toast.error(msg);
                    return [3 /*break*/, 6];
                case 5:
                    setRedeemingId(null);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [fetchInvestments, t]);
    var filteredAssets = react_1.useMemo(function () {
        return allRows.filter(function (item) {
            if (statusFilter !== 'All' && item.status !== statusFilter)
                return false;
            var itemDate = formatUtils_1.parseDotDate(item.dateTime);
            if (dateFrom) {
                var from = new Date(dateFrom + 'T00:00:00');
                if (itemDate < from)
                    return false;
            }
            if (dateTo) {
                var to = new Date(dateTo + 'T23:59:59.999');
                if (itemDate > to)
                    return false;
            }
            return true;
        });
    }, [allRows, statusFilter, dateFrom, dateTo]);
    var displayedAssets = displayLimit != null && Number.isFinite(displayLimit) ? filteredAssets.slice(0, displayLimit) : filteredAssets;
    react_1.useEffect(function () {
        onFilteredCount === null || onFilteredCount === void 0 ? void 0 : onFilteredCount(filteredAssets.length);
    }, [filteredAssets.length, onFilteredCount]);
    return (React.createElement("div", { className: "" },
        React.createElement("div", { className: "dark:bg-[#11111180] hidden md:block bg-[#F1F1FE] border border-[#65656526] dark:border-transparent mt-3 mb-4.75 rounded-xl p-1" },
            React.createElement("div", { className: "w-full py-3.5 bg-white border border-[#65656526] dark:border-transparent dark:bg-[#11111180] no-scrollbar px-3 rounded-[9px] overflow-x-auto" },
                React.createElement("table", { className: "w-full" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "bg-[#F1F1FE]  dark:bg-[#070707] rounded-[9px]" }, [
                            t('Asset ID'),
                            t('Date / Time'),
                            t('Bond'),
                            t('Principal'),
                            t('Maturity'),
                            t('Auto-reinvest'),
                            t('Withdraw'),
                            t('Redemption'),
                        ].map(function (title, i) { return (React.createElement("th", { key: i, className: "px-6 py-2.5 text-base font-semibold text-[#65656580] dark:text-[#FFFFFF80] whitespace-nowrap\n                " + (i === 0 ? 'rounded-l-[9px]  text-start' : 'text-center') + " \n                " + (i === 7 ? 'rounded-r-[9px]' : 'relative') },
                            title,
                            i !== 6 && (React.createElement("span", { className: "w-px h-4.25 top-1/2 -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0" })))); }))),
                    React.createElement("tbody", null, loading ? (React.createElement(React.Fragment, null, [1, 2, 3, 4, 5].map(function (i) { return (React.createElement("tr", { key: i, className: "border-b border-[#FFFFFF0D]" },
                        React.createElement("td", { className: "px-6 py-4" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-20" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-28 mx-auto" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-24 mx-auto" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-16 mx-auto" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-8 w-20 mx-auto rounded-lg" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-16 mx-auto" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-12 mx-auto" })),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement(skeleton_1.Skeleton, { className: "h-5 w-10 mx-auto" })))); }))) : filteredAssets.length === 0 ? (React.createElement("tr", null,
                        React.createElement("td", { colSpan: 8, className: "px-6 py-12 text-center text-[#65656580] dark:text-[#FFFFFF80]" }, t('Noinvestmentsyet')))) : (displayedAssets.map(function (item, index) { return (React.createElement("tr", { key: item._id + "-" + index, className: "border-b border-[#FFFFFF0D]" },
                        React.createElement("td", { className: "px-6 py-4 text-lg font-bold text-[#656565] dark:text-[#FFFFFFA6]" }, item.assetId),
                        React.createElement("td", { className: "px-6 py-4 text-center text-[#65656580] dark:text-[#FFFFFF80]" }, item.dateTime),
                        React.createElement("td", { className: "px-6 py-4 text-center text-[#656565] dark:text-white" },
                            React.createElement("div", { className: "flex items-center justify-center gap-2" }, item.product)),
                        React.createElement("td", { className: "px-6 py-4 text-center text-[#65656580] dark:text-[#FFFFFF80]" }, item.principal),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement("div", { className: "flex items-center justify-center" }, item.daysLeft === 'Matured' ? (React.createElement("span", { className: "text-[#656565] dark:text-white font-medium" }, t('Done'))) : item.daysLeft && item.daysLeft !== '—' && /^\d+ days$/.test(item.daysLeft) ? (React.createElement(React.Fragment, null,
                                React.createElement("span", { className: "text-[#656565] dark:text-white font-semibold" },
                                    item.daysLeft.split(' ')[0],
                                    " ",
                                    ''),
                                React.createElement("span", { className: "text-[#65656580] dark:text-[#FFFFFF80]" }, t('days left')))) : (React.createElement("span", { className: "text-[#65656580] dark:text-[#FFFFFF80]" }, "\u2014")))),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement("button", { disabled: item.autoReinvest || reinvestingId === item._id, onClick: function () { return handleReinvest(item); }, className: "w-32 py-2 rounded-lg font-bold text-xs transition-all\n      " + (item.status === 'completed' && !item.autoReinvest && reinvestingId !== item._id
                                    ? 'bg-gradient-to-b from-[#F5FF1E] to-[#42DE33] text-black hover:brightness-110 hover:shadow-md cursor-pointer'
                                    : 'dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]') }, reinvestingId === item._id ? (React.createElement("span", { className: "inline-flex items-center justify-center gap-2" },
                                React.createElement(Loader_1.Loader, { className: "h-4 w-4 shrink-0", ariaLabel: t('Enabling…') }),
                                t('Enabling…'))) : (t('Confirm')))),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement("button", { disabled: !(item.daysLeft === 'Matured'), onClick: function () { return (item.daysLeft === 'Matured' ? router.push('/wallet?tab=withdraw') : handleClick === null || handleClick === void 0 ? void 0 : handleClick(item)); }, className: "w-32 py-2 rounded-lg font-bold text-xs transition-all\n      " + (item.daysLeft === 'Matured'
                                    ? 'blueGrad1 text-white hover:brightness-110 hover:shadow-md cursor-pointer'
                                    : 'dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]') }, t('Confirm'))),
                        React.createElement("td", { className: "px-6 py-4 text-center" },
                            React.createElement("button", { onClick: function () { return handleRedeem(item); }, disabled: item.redemptionExpired || redeemingId === item._id, className: "w-32 py-2 rounded-lg font-bold text-xs transition-all\n      " + (!item.redemptionExpired && redeemingId !== item._id
                                    ? 'bg-linear-to-b from-[#D45254] to-[#AD0003] text-white hover:brightness-110 hover:shadow-md cursor-pointer'
                                    : 'dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]') }, redeemingId === item._id ? (React.createElement("span", { className: "inline-flex items-center justify-center gap-2" },
                                React.createElement(Loader_1.Loader, { className: "h-4 w-4 shrink-0", ariaLabel: t('Redeeming…') }),
                                t('Redeeming…'))) : (t('Redeem')))))); })))))),
        React.createElement("div", { className: "md:hidden flex flex-col bg-[#F1F1FE] dark:bg-[#FFFFFF05] border border-[#65656526] rounded-xl p-2" },
            React.createElement("div", { className: "grid grid-cols-4 px-3 py-3 bg-[#F1F1FE] dark:bg-[#070707] rounded-lg mb-2" }, [t('Asset ID'), t('Product'), t('Principal'), t('Maturity')].map(function (h, i) { return (React.createElement("span", { key: i, className: "text-[12px] font-semibold text-[#00000080] dark:text-[#FFFFFF80] " + (i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-center') }, h)); })),
            loading ? (React.createElement("div", { className: "py-12 flex flex-col items-center justify-center gap-3 text-[#65656580] dark:text-[#FFFFFF80] text-sm" },
                React.createElement(Loader_1.Loader, { className: "h-8 w-8", ariaLabel: t('Loading your investments') }),
                t('Loading your investments'))) : filteredAssets.length === 0 ? (React.createElement("div", { className: "py-12 text-center text-[#65656580] dark:text-[#FFFFFF80] text-sm" }, t('NoCompletedInvestments'))) : (displayedAssets.map(function (item, index) { return (React.createElement("div", { key: item._id + "-" + index, className: "flex flex-col border-b border-[#0000000D] dark:border-[#FFFFFF0D] py-4 last:border-0" },
                React.createElement("div", { className: "grid grid-cols-4 items-start px-1" },
                    React.createElement("div", { className: "flex flex-col" },
                        React.createElement("span", { className: "text-sm font-bold text-[#656565] dark:text-[#FFFFFFA6]" }, item.assetId),
                        React.createElement("span", { className: "text-xs text-[#FFFFFF80]" }, item.dateTime)),
                    React.createElement("div", { className: "flex flex-col items-center" },
                        React.createElement("span", { className: "text-sm text-[#656565] dark:text-white text-center leading-tight" }, item.product)),
                    React.createElement("div", { className: "text-center text-sm text-[#FFFFFF80] pt-1" }, item.principal),
                    React.createElement("div", { className: "flex items-center justify-end gap-1.5 pt-1" },
                        React.createElement("span", { className: "text-sm gap-1 items-center flex font-medium dark:text-white" },
                            item.maturity,
                            " ",
                            item.daysLeft && React.createElement("span", { className: "  text-[#FFFFFF80]  " }, item.daysLeft)))),
                (item.status === 'completed' || item.daysLeft === 'Matured') && (React.createElement("div", { className: "flex gap-3 mt-4 px-1" },
                    React.createElement("button", { className: "flex-1 py-2 rounded-lg font-bold text-xs bg-gradient-to-b from-[#F5FF1E] to-[#42DE33] text-black shadow-sm" }, t('Confirm')),
                    React.createElement("button", { className: "flex-1 py-2 rounded-lg font-bold text-xs blueGrad1 text-white shadow-sm" }, t('Confirm')),
                    React.createElement("button", { onClick: function () { return handleRedeem(item); }, disabled: item.redemptionExpired || redeemingId === item._id, className: "flex-1 py-2 rounded-lg font-bold text-xs shadow-sm inline-flex items-center justify-center gap-2 " + (!item.redemptionExpired && redeemingId !== item._id
                            ? 'bg-gradient-to-b from-[#D45254] to-[#AD0003] text-white'
                            : 'dark:bg-[#FFFFFF1A] bg-[#65656526] text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]') }, redeemingId === item._id ? (React.createElement(React.Fragment, null,
                        React.createElement(Loader_1.Loader, { className: "h-4 w-4 shrink-0", ariaLabel: t('Redeeming…') }),
                        t('Redeeming…'))) : (t('Redeem'))))))); })))));
};
