"use client";

import { useState } from "react";
import { INDUSTRY_OPTIONS, STYLE_PRESETS } from "@/lib/constants";
import {
  DensityOption,
  DesignStyle,
  IndustryOption,
  PersonalityOption,
  QuestionnaireInput,
} from "@/lib/types";

interface UploadFormProps {
  onSubmit: (questionnaire: QuestionnaireInput, logoFile: File | null) => void;
}

const PERSONALITY_OPTIONS: { value: PersonalityOption; label: string }[] = [
  { value: "formal", label: "رسمي" },
  { value: "balanced", label: "متوازن" },
  { value: "playful", label: "مرح" },
];

const DENSITY_OPTIONS: { value: DensityOption; label: string }[] = [
  { value: "minimal", label: "بسيط / مساحات واسعة" },
  { value: "balanced", label: "متوازن" },
  { value: "bold", label: "جريء / كثيف" },
];

const DESIGN_STYLE_KEYS = Object.keys(STYLE_PRESETS) as DesignStyle[];

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState<IndustryOption>("tech");
  const [personality, setPersonality] = useState<PersonalityOption>("balanced");
  const [density, setDensity] = useState<DensityOption>("balanced");
  const [designStyle, setDesignStyle] = useState<DesignStyle | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preferredColorsText, setPreferredColorsText] = useState("");

  const hasLogo = logoFile !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!designStyle) return; // الزر متعطل أصلاً في الحالة دي، ده حماية إضافية

    const preferredColors = preferredColorsText
      .split(",")
      .map((c) => c.trim())
      .filter((c) => /^#?[0-9A-Fa-f]{6}$/.test(c))
      .map((c) => (c.startsWith("#") ? c : `#${c}`));

    const questionnaire: QuestionnaireInput = {
      brandName: brandName.trim() || undefined,
      industry,
      personality,
      density,
      designStyle,
      preferredColors: !hasLogo && preferredColors.length > 0 ? preferredColors : undefined,
    };

    onSubmit(questionnaire, logoFile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Design Style — أول اختيار وأهمه */}
      <section>
        <h2 className="font-medium mb-3">اختار الـ Design Style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DESIGN_STYLE_KEYS.map((key) => {
            const preset = STYLE_PRESETS[key];
            const isSelected = designStyle === key;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setDesignStyle(key)}
                className={`text-right border rounded-lg p-3 transition-colors ${
                  isSelected
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {/* مكان الصورة — هيتحط هنا لاحقاً */}
                <div className="w-full aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center text-xs text-gray-400">
                  {isSelected ? (
                    <span className="text-white/70">preview</span>
                  ) : (
                    "preview"
                  )}
                </div>
                <p className="font-medium text-sm">{preset.label}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    isSelected ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Logo upload */}
      <section>
        <h2 className="font-medium mb-3">اللوجو (اختياري)</h2>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 file:ml-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700"
        />
      </section>

      {/* Preferred colors — تظهر بس لو مفيش لوجو */}
      {!hasLogo && (
        <section>
          <h2 className="font-medium mb-3">ألوان مفضلة (اختياري)</h2>
          <input
            type="text"
            placeholder="مثال: #1A73E8, #F4B400"
            value={preferredColorsText}
            onChange={(e) => setPreferredColorsText(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">افصل بين الألوان بفاصلة (hex codes)</p>
        </section>
      )}

      {/* Industry */}
      <section>
        <h2 className="font-medium mb-3">المجال</h2>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as IndustryOption)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </section>

      {/* Personality */}
      <section>
        <h2 className="font-medium mb-3">شخصية البراند</h2>
        <div className="flex gap-2">
          {PERSONALITY_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setPersonality(opt.value)}
              className={`flex-1 border rounded-lg py-2 text-sm ${
                personality === opt.value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Density */}
      <section>
        <h2 className="font-medium mb-3">الكثافة البصرية</h2>
        <div className="flex gap-2">
          {DENSITY_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setDensity(opt.value)}
              className={`flex-1 border rounded-lg py-2 text-sm ${
                density === opt.value
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Brand name */}
      <section>
        <h2 className="font-medium mb-3">اسم البراند (اختياري)</h2>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </section>

      <button
        type="submit"
        disabled={!designStyle}
        className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {designStyle ? "توليد الـ Design Tokens" : "اختار Design Style الأول"}
      </button>
    </form>
  );
}
