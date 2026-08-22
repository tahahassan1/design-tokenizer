"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ResultView from "@/components/ResultView";
import { DesignTokens, QuestionnaireInput } from "@/lib/types";

type ViewState =
  | { status: "form" }
  | { status: "loading" }
  | { status: "success"; tokens: DesignTokens }
  | { status: "error"; message: string };

export default function Home() {
  const [view, setView] = useState<ViewState>({ status: "form" });

  async function handleSubmit(questionnaire: QuestionnaireInput, logoFile: File | null) {
    setView({ status: "loading" });

    try {
      const formData = new FormData();
      formData.append("questionnaire", JSON.stringify(questionnaire));
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await fetch("/api/generate-tokens", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setView({ status: "error", message: data.error || "حدث خطأ غير متوقع" });
        return;
      }

      setView({ status: "success", tokens: data.tokens });
    } catch (err) {
      setView({
        status: "error",
        message: err instanceof Error ? err.message : "فشل الاتصال بالسيرفر",
      });
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Brand Tokens Generator</h1>
        <p className="text-gray-500 mt-1">
          ارفع لوجو، اختار ستايل، وجاوب على أسئلة قصيرة — واخد design tokens جاهزة.
        </p>
      </header>

      {view.status === "form" && <UploadForm onSubmit={handleSubmit} />}

      {view.status === "loading" && (
        <div className="text-center py-16 text-gray-500">جاري توليد الـ tokens...</div>
      )}

      {view.status === "error" && (
        <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-4">
          <p className="font-medium mb-1">حصل خطأ</p>
          <p className="text-sm">{view.message}</p>
          <button
            onClick={() => setView({ status: "form" })}
            className="mt-3 text-sm underline"
          >
            حاول تاني
          </button>
        </div>
      )}

      {view.status === "success" && (
        <ResultView tokens={view.tokens} onReset={() => setView({ status: "form" })} />
      )}
    </main>
  );
}
