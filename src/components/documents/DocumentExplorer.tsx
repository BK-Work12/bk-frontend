"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { type UserDocument } from "@/lib/api";

interface DocumentCategory {
  id: string;
  name: string;
  icon: string;
  documents: UserDocument[];
}

interface DocumentExplorerProps {
  categories: DocumentCategory[];
}

export const DocumentExplorer: React.FC<DocumentExplorerProps> = ({
  categories,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const { t } = useTranslation();

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDownload = (doc: UserDocument) => {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:5057";
    const url = `${apiBase}/documents/download/${doc.fileName}`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const hasDocuments = category.documents.length > 0;

        return (
          <div key={category.id} className="flex flex-col">
            {/* Category Folder Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className={`w-full text-start h-9 text-sm font-normal font-ui rounded-full px-5.5 flex gap-6.25 items-center transition-all duration-200 ${
                isExpanded
                  ? "bg-[#F5E8FF] border border-[#6B63DF] dark:border-transparent dark:bg-[#080808]"
                  : "bg-[#FFFFFF] border border-[#65656526] dark:border-transparent dark:bg-[#080808] hover:bg-[#F8F8F8] dark:hover:bg-[#252525]"
              }`}
            >
              {/* Folder Icon */}
              <Image
                width={30}
                height={30}
                src={category.icon}
                alt={category.name}
                className=""
              />

              {/* Category Name and Document Count */}
              <div className="flex-1 flex items-center justify-between">
                <span
                  className={`text-sm lg:text-base font-medium font-ui leading-tight ${
                    isExpanded
                      ? "text-black dark:text-white"
                      : "dark:text-white text-[#656565]"
                  }`}
                >
                  {category.name}
                </span>
                {hasDocuments && (
                  <span className="text-sm text-[#656565] dark:text-[#FFFFFF80] font-ui">
                    {category.documents.length}{" "}
                    {category.documents.length === 1
                      ? t("document")
                      : t("documents")}
                  </span>
                )}
              </div>
            </button>

            {/* Expanded Documents List */}
            {isExpanded && hasDocuments && (
              <div className="ml-8 mt-2 flex flex-col gap-2 pb-2">
                {category.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-[#0F0F0F] border border-[#65656526] dark:border-[#ffffff1a] rounded-lg p-3 flex items-center justify-between hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* File Icon */}
                      {/* <Image
                                                width={20}
                                                height={20}
                                                src="/assets/material-symbols-light_description-rounded.svg"
                                                alt="file"
                                                className=""
                                            /> */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-black dark:text-white truncate">
                          {doc.title}
                        </div>
                        <div className="text-xs text-[#656565] dark:text-[#FFFFFF80]">
                          {(() => { const d = new Date(doc.createdAt); const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); const yyyy = d.getFullYear(); const hh = String(d.getHours()).padStart(2, '0'); const min = String(d.getMinutes()).padStart(2, '0'); return `${dd}/${mm}/${yyyy}, ${hh}:${min}`; })()}
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(doc)}
                      className="ml-3 px-3 py-1 text-sm font-medium text-[#53A7FF] hover:text-[#4374FA] transition-colors whitespace-nowrap"
                    >
                      {t("Download")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {isExpanded && !hasDocuments && (
              <div className="ml-8 mt-2 p-3 text-sm text-[#656565] dark:text-[#FFFFFF80]">
                {t("Nodocuments")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
