"use client";

import { DesignTokens } from "@/lib/types";
import { generateDesignGuidelines } from "@/lib/designGuidelines";

interface ResultViewProps {
  tokens: DesignTokens;
  onReset: () => void;
}

export default function ResultView({ tokens, onReset }: ResultViewProps) {
  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    const filename = `${tokens.meta.brandName.replace(/\s+/g, "-").toLowerCase()}-tokens.json`;
    downloadFile(JSON.stringify(tokens, null, 2), filename, "application/json");
  }

  function handleDownloadMarkdown() {
    const filename = `${tokens.meta.brandName.replace(/\s+/g, "-").toLowerCase()}-design-guidelines.md`;
    downloadFile(generateDesignGuidelines(tokens), filename, "text/markdown");
  }

  return (
    <div className="space-y-8">
      {/* Visual preview — عشان تتأكد بعينك إن النتيجة منطقية قبل ما تنزل الـ JSON */}
      <section>
        <h2 className="font-medium mb-3">معاينة سريعة</h2>
        <div
          className="border p-6 space-y-4"
          style={{
            borderRadius: tokens.radius.value,
            borderColor: tokens.colors.neutral.shades["300"],
            fontFamily: tokens.typography.bodyFont,
          }}
        >
          <h3
            style={{
              fontFamily: tokens.typography.headingFont,
              fontSize: tokens.typography.scale["2xl"],
              color: tokens.colors.neutral.shades["900"],
            }}
          >
            {tokens.meta.brandName}
          </h3>
          <p style={{ color: tokens.colors.neutral.shades["600"] }}>
            هذا نص تجريبي بخط {tokens.typography.bodyFont} لمعاينة الألوان والشكل العام.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              style={{
                backgroundColor: tokens.colors.primary.base,
                color: "#FFFFFF",
                borderRadius: tokens.radius.value,
                boxShadow: tokens.shadow.value,
                padding: "0.5rem 1.25rem",
              }}
            >
              زر أساسي
            </button>
            <button
              style={{
                backgroundColor: tokens.colors.secondary.base,
                color: "#FFFFFF",
                borderRadius: tokens.radius.value,
                boxShadow: tokens.shadow.value,
                padding: "0.5rem 1.25rem",
              }}
            >
              زر ثانوي
            </button>
            <button
              style={{
                backgroundColor: tokens.colors.accent.base,
                color: "#FFFFFF",
                borderRadius: tokens.radius.value,
                boxShadow: tokens.shadow.value,
                padding: "0.5rem 1.25rem",
              }}
            >
              تمييز
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            {(["success", "warning", "error"] as const).map((key) => (
              <span
                key={key}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: tokens.colors.semantic[key],
                  color: "#FFFFFF",
                }}
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Color scales */}
      <section>
        <h2 className="font-medium mb-3">Color Scales</h2>
        <div className="space-y-3">
          {(["primary", "secondary", "accent", "neutral"] as const).map((colorKey) => (
            <div key={colorKey}>
              <p className="text-xs text-gray-500 mb-1 capitalize">{colorKey}</p>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {Object.entries(tokens.colors[colorKey].shades).map(([shade, hex]) => (
                  <div
                    key={shade}
                    className="flex-1 h-10 flex items-end justify-center"
                    style={{ backgroundColor: hex }}
                    title={`${shade}: ${hex}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Raw JSON */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">JSON الكامل</h2>
          <div className="flex gap-2">
            <button onClick={handleDownloadJson} className="text-sm bg-gray-900 text-white rounded-lg px-4 py-2">
              تحميل JSON
            </button>
            <button onClick={handleDownloadMarkdown} className="text-sm border border-gray-300 rounded-lg px-4 py-2">
              تحميل إرشادات Markdown
            </button>
          </div>
        </div>
        <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-4 overflow-x-auto max-h-96" dir="ltr">
          {JSON.stringify(tokens, null, 2)}
        </pre>
      </section>

      <button onClick={onReset} className="text-sm underline text-gray-500">
        توليد نسخة جديدة
      </button>
    </div>
  );
}
