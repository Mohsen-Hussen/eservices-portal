import ar from "@/i18n/dictionaries/ar.json";
import en from "@/i18n/dictionaries/en.json";
import { alternateLocale, isLocale } from "@/i18n/config";
import { t } from "@/i18n/format";
import { switchLocalePath } from "@/components/locale-switcher";
import { detectLocale } from "@/i18n/detect-locale";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("dictionaries", () => {
  it("Arabic and English have exactly the same keys", () => {
    expect(keyPaths(ar).sort()).toEqual(keyPaths(en).sort());
  });

  it("keep the same placeholders in every translation", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    const flat = (d: unknown, path: string) =>
      path
        .split(".")
        .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], d) as string;
    for (const path of keyPaths(en)) {
      expect([path, placeholders(flat(ar, path))]).toEqual([path, placeholders(flat(en, path))]);
    }
  });
});

describe("t()", () => {
  it("interpolates values and leaves unknown placeholders intact", () => {
    expect(t("Step {current} of {total}", { current: 1, total: 4 })).toBe("Step 1 of 4");
    expect(t("Hello {name}")).toBe("Hello {name}");
  });
});

describe("locale helpers", () => {
  it("validates and alternates locales", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(alternateLocale("ar")).toBe("en");
  });

  it("swaps only the locale segment of a path", () => {
    expect(switchLocalePath("/ar/services/stadium-booking", "en")).toBe(
      "/en/services/stadium-booking",
    );
    expect(switchLocalePath("/en", "ar")).toBe("/ar");
  });

  it("detects the preferred locale from Accept-Language", () => {
    expect(detectLocale("en-US,en;q=0.9,ar;q=0.8")).toBe("en");
    expect(detectLocale("fr-FR,ar-SA;q=0.7")).toBe("ar");
    expect(detectLocale("fr-FR")).toBe("ar");
    expect(detectLocale(null)).toBe("ar");
  });
});
