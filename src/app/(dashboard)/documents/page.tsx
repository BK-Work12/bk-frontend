"use client";
import ArrowDown from "@/components/icons/arrowDown";
import { GradientBorderGray } from "@/components/ui/gradientBorder";
import { DocumentExplorer } from "@/components/documents/DocumentExplorer";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getUserDocuments, type UserDocument } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useTranslation } from "react-i18next";

function matchSearch(document: UserDocument, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  const searchable = [document.title].join(" ").toLowerCase();
  return searchable.includes(q);
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const { t } = useTranslation();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;
      const docs = await getUserDocuments(token);
      setDocuments(docs);
    })();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (!matchSearch(doc, searchQuery)) return false;
      return true;
    });
  }, [documents, searchQuery]);

  // Organize documents by category using the type field
  const categories = [
    {
      id: "investment-confirmation",
      name: t("InvestmentConfirmationReceipt"),
      icon: "/assets/material-symbols-light_folder-outline-rounded.svg",
      documents: filteredDocuments.filter(
        (doc) => doc.type === "investment_confirmation",
      ),
    },
    {
      id: "information-memorandum",
      name: t("InformationMemorandum"),
      icon: "/assets/material-symbols-light_folder-outline-rounded.svg",
      documents: filteredDocuments.filter(
        (doc) => doc.type === "information_memorandum",
      ),
    },
    {
      id: "subscription-agreements",
      name: t("SubscriptionAgreements"),
      icon: "/assets/material-symbols-light_folder-outline-rounded.svg",
      documents: filteredDocuments.filter(
        (doc) => doc.type === "subscription_agreement",
      ),
    },
  ];

  // Get the selected category or all categories if none selected
  const displayedCategories = selectedCategoryId
    ? categories.filter((cat) => cat.id === selectedCategoryId)
    : categories;

  const selectedCategoryName = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)?.name ||
      t("Category")
    : t("Category");

  return (
      <div className="pt-18.5">
        <GradientBorderGray className="bgBorder">
          <div className="dark:bg-[#0c0c0c] rounded-[20px] border-[#65656526] border dark:border-transparent pt-3.5 pb-5.5 lg:pr-16 px-3.25 lg:pl-5.75">
            <div className="lg:hidden flex justify-between items-center gap-3 sm:gap-6 w-full">
              <span className="text-sm font-normal w-auto text-[#656565] dark:text-white font-ui whitespace-nowrap">
                {t("Filterby")}
              </span>

              <div className="flex items-center gap-2">
                <span className="dark:text-[#FFFFFF80] text-[#65656580] text-sm font-normal font-ui">
                  {selectedCategoryName}
                </span>
                {/* Dark */}
                <span className="hidden mt-2 dark:block">
                  <Image
                    src="/assets/Polygon 11.png"
                    alt=""
                    width={13}
                    height={13}
                  />
                </span>

                {/* Light */}
                <span className="dark:hidden">
                  <Image
                    src="/assets/Polygon 11.png"
                    alt=""
                    width={13}
                    height={13}
                  />
                </span>
              </div>

              <div className="w-[100px]">
                <div className="h-[46px] rounded-[8px] flex items-center gap-2 px-3 bg-[#FFFFFF] dark:bg-transparent w-full">
                  <Image
                    width={24}
                    height={24}
                    src="/assets/material-symbols-light_search.png"
                    className="hidden dark:block"
                    alt=""
                  />
                  <Image
                    width={24}
                    height={24}
                    src="/assets/material-symbols-light_search (1).png"
                    className="dark:hidden"
                    alt=""
                  />

                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent text-black dark:text-white outline-none placeholder:text-[#65656580] dark:placeholder:text-[#FFFFFF80] font-ui text-sm w-[58px]"
                  />
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-end items-center gap-12">
              <span className="text-sm font-normal text-[#656565] dark:text-white font-ui">
                {t("Filterby")}
              </span>
              <div className="max-w-[421px] w-full py-2 rounded-[6px] bg-[#F1F1FE] border border-[#65656526] dark:border-transparent dark:bg-[#070707] flex items-center gap-[37px] px-2">
                <div className="relative">
                  <button
                    onClick={() => setIsCategoryOpen((prev) => !prev)}
                    className="pl-5 flex items-center gap-[14px]"
                  >
                    <span className="dark:text-[#FFFFFF80] text-[#65656580] text-sm font-normal font-ui">
                      {selectedCategoryName}
                    </span>

                    {/* Arrow wrapper rotates */}
                    <span
                      className={`w-3.25 h-3.25 mt-2 transition-transform duration-300 ease-in-out
      ${isCategoryOpen ? "rotate-180" : "rotate-0"}
    `}
                    >
                      {/* Dark */}
                      <span className="hidden dark:block">
                        <Image
                          src="/assets/Polygon 11.png"
                          alt=""
                          width={13}
                          height={13}
                        />
                      </span>

                      {/* Light */}
                      <span className="dark:hidden">
                        <Image
                          src="/assets/Polygon 11.png"
                          alt=""
                          width={13}
                          height={13}
                        />
                      </span>
                    </span>
                  </button>
                  <div
                    className={`
    absolute left-0 top-full z-50 w-56
    mt-2 overflow-hidden rounded-lg
    bg-white dark:bg-[#1E1E20]
    border border-[#65656526] dark:border-transparent
    transition-all duration-300 ease-in-out
    ${isCategoryOpen ? "max-h-60 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"}
  `}
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setSelectedCategoryId(null);
                          setIsCategoryOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-md
                   text-[#656565] dark:text-white
                   hover:bg-[#F1F1FE] dark:hover:bg-[#2A2A2A]
                   transition"
                      >
                        {t("AllCategories")}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setIsCategoryOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-md
                   text-[#656565] dark:text-white
                   hover:bg-[#F1F1FE] dark:hover:bg-[#2A2A2A]
                   transition"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-11.5 rounded-lg flex items-center gap-4.5 px-3 bg-[#FFFFFF] dark:bg-[#FFFFFF0A] w-full">
                  <Image
                    width={24}
                    height={24}
                    src="/assets/material-symbols-light_search_white.svg"
                    className="hidden dark:block"
                    alt=""
                  />
                  <Image
                    width={24}
                    height={24}
                    src="/assets/material-symbols-light_search (1).png"
                    className=" dark:hidden"
                    alt=""
                  />
                  <input
                    type="text"
                    placeholder={t("Search categories")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-white outline-none placeholder:text-[#65656580] dark:placeholder:text-[#FFFFFF80] font-ui text-lg w-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 bg-[#F1F1FE] border-[#65656526] dark:border-transparent border dark:bg-[#1E1E2080] rounded-xl p-2 flex flex-col gap-2.5">
              <DocumentExplorer categories={displayedCategories} />
            </div>

            {/* <button
              className="mt-2.5 lg:hidden rounded-xl h-14.75 text-[22px] font-bold font-ui w-full"
              style={{
                background: 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
              }}
            >
              {t('Addfiles')}
            </button> */}
          </div>
        </GradientBorderGray>
      </div>
  );
};

export default DocumentsPage;
