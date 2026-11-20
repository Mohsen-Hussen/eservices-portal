import { generateRequestId, requestsStore } from "@/lib/requests-store";

beforeEach(() => window.localStorage.clear());

describe("requestsStore", () => {
  it("adds requests newest-first and notifies subscribers", () => {
    const listener = jest.fn();
    const unsubscribe = requestsStore.subscribe(listener);

    requestsStore.add({ serviceSlug: "a", applicantName: "First" });
    requestsStore.add({ serviceSlug: "b", applicantName: "Second" });

    expect(requestsStore.getSnapshot().map((r) => r.applicantName)).toEqual(["Second", "First"]);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });

  it("returns a stable snapshot while storage is unchanged", () => {
    requestsStore.add({ serviceSlug: "a", applicantName: "First" });
    expect(requestsStore.getSnapshot()).toBe(requestsStore.getSnapshot());
  });

  it("recovers from corrupted storage", () => {
    window.localStorage.setItem("khadamat:requests", "{not json");
    expect(requestsStore.getSnapshot()).toEqual([]);
  });
});

describe("generateRequestId", () => {
  it("uses the year and a zero-padded serial", () => {
    expect(generateRequestId(new Date("2026-03-01"), () => 0.000042)).toBe("REQ-2026-000042");
  });
});
