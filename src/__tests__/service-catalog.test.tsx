import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ServiceCatalog } from "@/components/service-catalog";
import en from "@/i18n/dictionaries/en.json";
import { filterServices, services } from "@/lib/services";

function renderCatalog() {
  render(
    <ServiceCatalog
      lang="en"
      services={services}
      dict={{ catalog: en.catalog, categories: en.categories }}
    />,
  );
}

describe("filterServices", () => {
  it("matches Arabic and English text case-insensitively", () => {
    expect(filterServices(services, { query: "STADIUM" }).map((s) => s.slug)).toEqual([
      "stadium-booking",
    ]);
    expect(filterServices(services, { query: "ملعب" }).map((s) => s.slug)).toEqual([
      "stadium-booking",
    ]);
  });

  it("combines search with a category", () => {
    const results = filterServices(services, { query: "license", category: "licensing" });
    expect(results.every((s) => s.category === "licensing")).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});

describe("<ServiceCatalog />", () => {
  it("lists every service by default", () => {
    renderCatalog();
    expect(screen.getAllByRole("listitem")).toHaveLength(services.length);
    expect(screen.getByText(`${services.length} services`)).toBeInTheDocument();
  });

  it("filters by category and marks the active chip", async () => {
    const user = userEvent.setup();
    renderCatalog();

    const investment = screen.getByRole("button", { name: "Investment" });
    await user.click(investment);

    expect(investment).toHaveAttribute("aria-pressed", "true");
    const cards = screen.getAllByRole("listitem");
    cards.forEach((card) => expect(within(card).getByText("Investment")).toBeInTheDocument());
  });

  it("shows an empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderCatalog();
    await user.type(screen.getByRole("searchbox", { name: "Search services" }), "zzz");
    expect(screen.getByText("No services match your search.")).toBeInTheDocument();
  });
});
