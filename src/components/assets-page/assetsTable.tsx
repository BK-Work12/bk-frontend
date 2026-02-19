"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import {
  getInvestments,
  setSubscriptionAutoReinvest,
  cancelSubscription,
  type InvestmentListItem,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { getCached, setCache } from "@/lib/cache";
import { toast } from "react-toastify";
import {
  parseDotDate,
  formatIsoToDisplay,
  daysLeftFromMaturity,
  formatDateMedium,
  isRedemptionExpired,
} from "@/lib/formatUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/Loader";
import ConfirmModal from "@/components/ui/confirmModal";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

/** Row shape for the table (derived from user's investments). */
type AssetRow = {
  _id: string;
  assetId: string;
  dateTime: string;
  product: string;
  period: string;
  principal: string;
  maturity: string;
  status: "completed" | "pending";
  daysLeft?: string;
  /** True when redemption period has expired (Redeem button should be disabled). */
  redemptionExpired: boolean;
  /** For reinvest: strategy and amount from original subscription. */
  strategyId?: string;
  amount?: number;
  /** When true, will be reinvested automatically when the period ends. */
  autoReinvest?: boolean;
};

function investmentToRow(item: InvestmentListItem): AssetRow {
  const statusNorm = (item.status ?? "").toUpperCase();
  const completed = ["OPEN", "CLOSING", "FINISHED", "CONFIRMED"].includes(
    statusNorm,
  );
  const principal =
    item.currency?.toUpperCase() === "USD"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(item.amount ?? 0)
      : `${(item.amount ?? 0).toFixed(2)} ${(item.currency ?? "USD").toUpperCase()}`;
  return {
    _id: item.id,
    assetId:
      item.subid != null
        ? String(item.subid)
        : item.id.length > 12
          ? `${item.id.slice(0, 8)}…`
          : item.id,
    dateTime: formatIsoToDisplay(item.createdAt),
    product: item.product ?? "—",
    period: item.period ?? "—",
    principal,
    maturity: formatDateMedium(item.maturityDate),
    status: completed ? "completed" : "pending",
    daysLeft: daysLeftFromMaturity(item.maturityDate),
    redemptionExpired: isRedemptionExpired(item.maturityDate, item.redemption),
    strategyId: item.strategyId,
    amount: item.amount ?? 0,
    autoReinvest: item.autoReinvest ?? false,
  };
}

type AssetsTableProps = {
  statusFilter?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  displayLimit?: number;
  onFilteredCount?: (total: number) => void;
  handleClick?: (item?: AssetRow) => void;
};

export const AssetsTable = ({
  statusFilter = "All",
  dateFrom = null,
  dateTo = null,
  displayLimit,
  onFilteredCount,
  handleClick,
}: AssetsTableProps) => {
  const cachedRows = getCached<AssetRow[]>('assets_rows');
  const [allRows, setAllRows] = useState<AssetRow[]>(cachedRows ?? []);
  const [loading, setLoading] = useState(!cachedRows);
  const [reinvestingId, setReinvestingId] = useState<string | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemModalItem, setRedeemModalItem] = useState<AssetRow | null>(null);
  const { t } = useTranslation();
  const router = useRouter();

  const fetchInvestments = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAllRows([]);
      setLoading(false);
      return;
    }
    try {
      const { list } = await getInvestments(token);
      const completedStatuses = ["OPEN", "CLOSING", "FINISHED", "CONFIRMED"];
      const completedOnly = list.filter((inv) =>
        completedStatuses.includes((inv.status ?? "").toUpperCase()),
      );
      const rows = completedOnly.map(investmentToRow);
      setAllRows(rows);
      setCache('assets_rows', rows);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleReinvest = useCallback(
    async (item: AssetRow) => {
      if (item.autoReinvest) return;
      const token = getToken();
      if (!token) {
        toast.error(t("Please log in to enable auto-reinvest"));
        return;
      }
      setReinvestingId(item._id);
      try {
        await setSubscriptionAutoReinvest(token, item._id);
        toast.success(
          t(
            "Auto-reinvest enabled. This investment will be reinvested automatically when the period ends.",
          ),
        );
        await fetchInvestments();
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to enable auto-reinvest";
        toast.error(msg);
      } finally {
        setReinvestingId(null);
      }
    },
    [fetchInvestments, t],
  );

  const handleRedeem = useCallback(
    async (item: AssetRow) => {
      if (item.redemptionExpired) return;
      const token = getToken();
      if (!token) {
        toast.error(t("Please log in to redeem"));
        return;
      }
      setRedeemingId(item._id);
      try {
        await cancelSubscription(token, item._id);
        toast.success(
          t(
            "Subscription cancelled. The amount has been returned to your available balance.",
          ),
        );
        await fetchInvestments();
      } catch (err) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: string }).message)
            : "Failed to cancel subscription";
        toast.error(msg);
      } finally {
        setRedeemingId(null);
      }
    },
    [fetchInvestments, t],
  );

  const filteredAssets = useMemo(() => {
    return allRows.filter((item) => {
      if (statusFilter !== "All" && item.status !== statusFilter) return false;
      const itemDate = parseDotDate(item.dateTime);
      if (dateFrom) {
        const from = new Date(dateFrom + "T00:00:00");
        if (itemDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo + "T23:59:59.999");
        if (itemDate > to) return false;
      }
      return true;
    });
  }, [allRows, statusFilter, dateFrom, dateTo]);

  const displayedAssets: AssetRow[] =
    displayLimit != null && Number.isFinite(displayLimit)
      ? filteredAssets.slice(0, displayLimit)
      : filteredAssets;

  useEffect(() => {
    onFilteredCount?.(filteredAssets.length);
  }, [filteredAssets.length, onFilteredCount]);

  return (
    <div className="">
      <div className="dark:bg-[#11111180] hidden md:block bg-[#F1F1FE] border border-[#65656526] dark:border-transparent mt-3 mb-4.75 rounded-xl p-1">
        <div className="w-full py-3.5 bg-white border border-[#65656526] dark:border-transparent dark:bg-[#11111180] no-scrollbar px-3 rounded-[9px] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F1F1FE]  dark:bg-[#070707] rounded-[9px]">
                {[
                  t("Asset ID"),
                  t("Date / Time"),
                  t("Product"),
                  t("Principal"),
                  t("Maturity"),
                  t("Auto-reinvest"),
                  t("Withdraw"),
                  t("Redemption"),
                ].map((title, i) => (
                  <th
                    key={i}
                    className={`px-2 lg:px-4 py-2.5 text-xs lg:text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80] whitespace-nowrap
                ${i === 0 ? "rounded-l-[9px]  text-start" : "text-center"} 
                ${i === 7 ? "rounded-r-[9px]" : "relative"}`}
                  >
                    {title}
                    {i !== 6 && (
                      <span className="w-px h-4.25 top-1/2 -translate-y-1/2 bg-[#0000001A] dark:bg-[#FFFFFF1A] absolute right-0" />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-[#FFFFFF0D]">
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-5 w-28 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-5 w-24 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-8 w-20 mx-auto rounded-lg" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-5 w-12 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Skeleton className="h-5 w-10 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]"
                  >
                    {t("Noinvestmentsyet")}
                  </td>
                </tr>
              ) : (
                displayedAssets.map((item, index) => (
                  <tr
                    key={`${item._id}-${index}`}
                    className="border-b border-[#FFFFFF0D] hover:bg-[#FFFFFF06] transition-colors duration-150 cursor-default"
                  >
                    {/* Asset ID */}
                    <td className="px-2 lg:px-4 py-3 text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]">
                      {item.assetId}
                    </td>

                    {/* Date / Time */}
                    <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                      {item.dateTime}
                    </td>

                    {/* Product */}
                    <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#656565] dark:text-white">
                      <div className="flex items-center justify-center gap-2">
                        {item.product}
                      </div>
                    </td>

                    {/* Principal */}
                    <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                      {item.principal}
                    </td>

                    {/* Maturity */}
                    <td className="px-2 lg:px-4 py-3 text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80] whitespace-nowrap">
                      {item.daysLeft === "Matured" ? (
                        t("Done")
                      ) : item.daysLeft &&
                        item.daysLeft !== "—" &&
                        /^\d+ days$/.test(item.daysLeft) ? (
                        `${item.daysLeft.split(" ")[0]} ${t("days left")}`
                      ) : (
                        "—"
                      )}
                    </td>

                    <td
                      className="px-2 lg:px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={
                          item.autoReinvest || reinvestingId === item._id
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReinvest(item);
                        }}
                        className={`px-4 py-1.5 rounded-full font-normal font-ui text-xs transition-all
      ${
        item.status === "completed" &&
        !item.autoReinvest &&
        reinvestingId !== item._id
          ? "bg-gradient-to-b from-[#F5FF1E] to-[#42DE33] text-black hover:brightness-110 hover:shadow-md cursor-pointer"
          : "dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]"
      }`}
                      >
                        {reinvestingId === item._id ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader
                              className="h-4 w-4 shrink-0"
                              ariaLabel={t("Enabling…")}
                            />
                            {t("Enabling…")}
                          </span>
                        ) : (
                          t("Confirm")
                        )}
                      </button>
                    </td>
                    {/* Withdraw Button – routes to wallet withdraw tab when matured */}
                    <td
                      className="px-2 lg:px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        disabled={!(item.daysLeft === "Matured")}
                        onClick={(e) => {
                          e.stopPropagation();
                          item.daysLeft === "Matured"
                            ? router.push("/wallet?tab=withdraw")
                            : handleClick?.(item);
                        }}
                        className={`px-4 py-1.5 rounded-full font-normal font-ui text-xs transition-all
      ${
        item.daysLeft === "Matured"
          ? "blueGrad1 text-white hover:brightness-110 hover:shadow-md cursor-pointer"
          : "dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]"
      }`}
                      >
                        {t("Confirm")}
                      </button>
                    </td>

                    {/* Redeem Button – only this button opens the ConfirmModal */}
                    <td
                      className="px-2 lg:px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRedeemModalItem(item);
                        }}
                        disabled={
                          item.redemptionExpired || redeemingId === item._id
                        }
                        className={`px-4 py-1.5 rounded-full font-normal font-ui text-xs transition-all
      ${
        !item.redemptionExpired && redeemingId !== item._id
          ? "bg-linear-to-b from-[#D45254] to-[#AD0003] text-white hover:brightness-110 hover:shadow-md cursor-pointer"
          : "dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]"
      }`}
                      >
                        {redeemingId === item._id ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader
                              className="h-4 w-4 shrink-0"
                              ariaLabel={t("Redeeming…")}
                            />
                            {t("Redeeming…")}
                          </span>
                        ) : (
                          <>{t("Redeem")}</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* --- MOBILE CARD VIEW --- */}
      <div className="md:hidden flex flex-col bg-[#F1F1FE] dark:bg-[#FFFFFF05] border border-[#65656526] rounded-xl p-2">
        {/* Mobile Header */}
        <div className="grid grid-cols-4 px-3 py-3 bg-[#F1F1FE] dark:bg-[#070707] rounded-lg mb-2">
          {[t("Asset ID"), t("Product"), t("Principal"), t("Maturity")].map(
            (h, i) => (
              <span
                key={i}
                className={`text-xs font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80] ${
                  i === 0 ? "text-left" : i === 3 ? "text-right" : "text-center"
                }`}
              >
                {h}
              </span>
            ),
          )}
        </div>

        {/* Mobile Rows */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#65656580] dark:text-[#FFFFFF80] text-sm">
            <Loader
              className="h-8 w-8"
              ariaLabel={t("Loading your investments")}
            />
            {t("Loading your investments")}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-12 text-center text-[#65656580] dark:text-[#FFFFFF80] text-sm">
            {t("NoCompletedInvestments")}
          </div>
        ) : (
          displayedAssets.map((item, index) => (
            <div
              key={`${item._id}-${index}`}
              className="flex flex-col border-b border-[#0000000D] dark:border-[#FFFFFF0D] py-4 last:border-0 hover:bg-[#FFFFFF04] transition-colors duration-150 rounded-lg"
            >
              <div className="grid grid-cols-4 items-start px-1">
                {/* Asset ID & Date */}
                <div className="flex flex-col">
                  <span className="text-sm font-normal font-ui text-[#656565] dark:text-[#FFFFFFA6]">
                    {item.assetId}
                  </span>
                  <span className="text-xs font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                    {item.dateTime}
                  </span>
                </div>

                {/* Product */}
                <div className="flex flex-col items-center">
                  <span className="text-sm font-normal font-ui text-[#656565] dark:text-white text-center">
                    {item.product}
                  </span>
                </div>

                {/* Principal */}
                <div className="text-center text-sm font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                  {item.principal}
                </div>

                {/* Maturity */}
                <div className="text-right text-xs font-normal font-ui text-[#65656580] dark:text-[#FFFFFF80]">
                  {item.daysLeft === 'Matured' ? (
                    t('Done')
                  ) : item.daysLeft && item.daysLeft !== '—' && /^\d+ days$/.test(item.daysLeft) ? (
                    `${item.daysLeft.split(' ')[0]} ${t('days left')}`
                  ) : (
                    '—'
                  )}
                </div>
                {/* <div className="flex items-center justify-end gap-1.5 pt-1">
                  <span className="text-sm gap-1 items-center flex font-medium dark:text-white">
                    {item.daysLeft && (
                      <span className="  text-[#FFFFFF80]  ">
                        {item.daysLeft}
                      </span>
                    )}
                  </span>
                </div> */}
              </div>

              {/* Conditional Action Buttons – enabled when status is completed or investment period has ended (Matured) */}
              {(item.status === "completed" || item.daysLeft === "Matured") && (
                <div
                  className="flex gap-3 mt-4 px-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    disabled={item.autoReinvest || reinvestingId === item._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReinvest(item);
                    }}
                    className={`flex-1 py-2 rounded-lg font-normal font-ui text-xs shadow-sm ${item.status === "completed" && !item.autoReinvest && reinvestingId !== item._id ? "bg-gradient-to-b from-[#F5FF1E] to-[#42DE33] text-black" : "dark:bg-[#FFFFFF1A] bg-[#65656526] text-[#BDBDBD] cursor-not-allowed"}`}
                  >
                    {reinvestingId === item._id ? t("Enabling…") : t("Confirm")}
                  </button>
                  <button
                    type="button"
                    disabled={!(item.daysLeft === "Matured")}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.daysLeft === "Matured"
                        ? router.push("/wallet?tab=withdraw")
                        : handleClick?.(item);
                    }}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs shadow-sm ${item.daysLeft === "Matured" ? "blueGrad1 text-white" : "dark:bg-[#FFFFFF1A] bg-[#65656526] text-[#BDBDBD] cursor-not-allowed"}`}
                  >
                    {t("Confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRedeemModalItem(item);
                    }}
                    disabled={
                      item.redemptionExpired || redeemingId === item._id
                    }
                    className={`flex-1 py-2 rounded-lg font-bold text-xs shadow-sm inline-flex items-center justify-center gap-2 ${
                      !item.redemptionExpired && redeemingId !== item._id
                        ? "bg-gradient-to-b from-[#D45254] to-[#AD0003] text-white"
                        : "dark:bg-[#FFFFFF1A] bg-[#65656526] text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]"
                    }`}
                  >
                    {t('Redeem')}
                  </button>
                </div>
              )}
              {/* {!(item.status === 'completed' || item.daysLeft === 'Matured') && (
                <div className="flex gap-3 mt-4 px-1">
                  <button
                    disabled
                    className="flex-1 py-2 rounded-lg font-bold text-xs dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A] "
                  >
                    {t('Confirm')}
                  </button>
                  <button
                    disabled
                    className="flex-1 py-2 rounded-lg font-bold text-xs dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]   "
                  >
                    {t('Confirm')}
                  </button>
                  <button
                    disabled
                    className="flex-1 py-2 rounded-lg font-bold text-xs dark:bg-[#FFFFFF1A] bg-[#65656526]   text-[#BDBDBD] cursor-not-allowed border border-[#FFFFFF1A]"
                  >
                    {t('Redeem')}
                  </button>
                </div>
              )} */}
            </div>
          ))
        )}
      </div>

      {/* Confirm modal opens only when the user clicks the Redeem button (setRedeemModalItem is called there only). */}
      <ConfirmModal
        isOpen={redeemModalItem != null}
        onClose={() => setRedeemModalItem(null)}
        onConfirm={
          redeemModalItem
            ? async () => {
              await handleRedeem(redeemModalItem);
            }
            : undefined
        }
      />
    </div>
  );
};
