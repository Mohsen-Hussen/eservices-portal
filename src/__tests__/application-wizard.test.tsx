import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ApplicationWizard } from "@/components/application-wizard";
import en from "@/i18n/dictionaries/en.json";
import { requestsStore } from "@/lib/requests-store";

function renderWizard() {
  render(
    <ApplicationWizard
      lang="en"
      serviceSlug="stadium-booking"
      serviceTitle="Stadium booking"
      dict={{ wizard: en.wizard, errors: en.errors }}
    />,
  );
}

const next = () => screen.getByRole("button", { name: /next/i });

beforeEach(() => {
  window.localStorage.clear();
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

afterEach(() => jest.restoreAllMocks());

describe("<ApplicationWizard />", () => {
  it("blocks the first step until required fields are valid", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(next());

    expect(await screen.findAllByText("This field is required")).toHaveLength(4);
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("heading", { level: 2, name: "Applicant" })).toBeInTheDocument();
  });

  it("clears an error as soon as the value is fixed", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.type(screen.getByLabelText(/mobile/i), "123");
    await user.click(next());
    expect(await screen.findByText(en.errors.mobile)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/mobile/i));
    await user.type(screen.getByLabelText(/mobile/i), "0551234567");
    expect(screen.queryByText(en.errors.mobile)).not.toBeInTheDocument();
  });

  it("completes the whole flow and stores the request", async () => {
    const user = userEvent.setup();
    renderWizard();

    // Step 1 — applicant
    await user.type(screen.getByLabelText(/full name/i), "Mohsen Hussein");
    await user.type(screen.getByLabelText(/national id/i), "1234567890");
    await user.type(screen.getByLabelText(/mobile/i), "0551234567");
    await user.type(screen.getByLabelText(/email/i), "mohsen@example.com");
    await user.click(next());

    // Step 2 — details
    expect(
      await screen.findByRole("heading", { level: 2, name: "Request details" }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/entity/i), "Riyadh Sports Club");
    await user.selectOptions(screen.getByLabelText(/city/i), "jeddah");
    await user.type(screen.getByLabelText(/start date/i), "2099-01-15");
    await user.type(
      screen.getByLabelText(/description/i),
      "Weekend training sessions for juniors.",
    );
    await user.click(next());

    // Step 3 — attachments
    expect(
      await screen.findByRole("heading", { level: 2, name: "Attachments" }),
    ).toBeInTheDocument();
    await user.click(next());
    expect(await screen.findByText(en.errors.attachmentsRequired)).toBeInTheDocument();
    const file = new File(["%PDF"], "cr.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText(/supporting documents/i), file);
    expect(screen.getByText("cr.pdf")).toBeInTheDocument();
    await user.click(next());

    // Step 4 — review
    expect(
      await screen.findByRole("heading", { level: 2, name: "Review & submit" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jeddah")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /submit request/i }));
    expect(await screen.findByText(en.errors.declaration)).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(en.wizard.success.title, {}, { timeout: 2000 }),
    ).toBeInTheDocument();
    const stored = requestsStore.getSnapshot();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      serviceSlug: "stadium-booking",
      applicantName: "Mohsen Hussein",
      status: "submitted",
    });
  });
});
