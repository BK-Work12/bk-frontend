"use client";

import i18next from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const apiKey = "D9jkoT1WfeCTBm4-vhKEbQ";
const loadPath = `https://api.i18nexus.com/project_resources/translations/{{lng}}/{{ns}}.json?api_key=${apiKey}`;

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    ns: ["default"],
    defaultNS: "default",

    supportedLngs: [
      "en",
      "fr",
      "ro",
      "bg",
      "ar",
      "zh-CN",
      "ja-JP",
      "cs",
      "de",
      "el",
      "hu",
      "id",
      "it",
      "ko-KR",
      "pl",
      "pt",
      "ru",
      "es",
      "th",
      "tr",
    ],

    backend: {
      loadPath: loadPath,
    },
  });

export default i18next;
