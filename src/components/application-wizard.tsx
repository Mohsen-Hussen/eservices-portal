"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useForm, useWatch, type FieldErrors, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CircleCheck, FileText, Pencil, Upload, X } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatDate, t } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { requestsStore } from "@/lib/requests-store";
import {
  ACCEPTED_FILE_TYPES,
  applicationSchema,
  cities,
  stepFields,
  todayISO,
  type ApplicationValues,
  type ErrorKey,
} from "@/lib/validation";
import { cn, formatFileSize } from "@/lib/utils";
import { Button, buttonClasses } from "./ui/button";
import { Field, Input, Select, Textarea, describedBy } from "./ui/field";
import { Stepper } from "./ui/stepper";

export type WizardDictionary = Pick<Dictionary, "wizard" | "errors">;

interface ApplicationWizardProps {
  lang: Locale;
  serviceSlug: string;
  serviceTitle: string;
  dict: WizardDictionary;
}

const defaultValues: Partial<ApplicationValues> = {
  fullName: "",
  nationalId: "",
  email: "",
  mobile: "",
  entityName: "",
  startDate: "",
  description: "",
  attachments: [],
};

export function ApplicationWizard({
  lang,
  serviceSlug,
  serviceTitle,
  dict,
}: ApplicationWizardProps) {
  const [step, setStep] = useState(0);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues,
    mode: "onTouched",
  });

  // Once a field shows an error, re-validate it on every change so the message
  // disappears as soon as the value is fixed (not only on blur).
  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ name }) => {
        const field = name as keyof ApplicationValues | undefined;
        if (field && form.getFieldState(field).error) void form.trigger(field);
      },
    });
  }, [form]);

  const steps = [
    dict.wizard.steps.applicant,
    dict.wizard.steps.details,
    dict.wizard.steps.attachments,
    dict.wizard.steps.review,
  ];
  const isLast = step === steps.length - 1;

  const goTo = (next: number) => {
    setStep(next);
    // Move focus to the step heading so keyboard and screen-reader users land on the new step.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleNext = async () => {
    const valid = await form.trigger(stepFields[step], { shouldFocus: true });
    if (valid) goTo(step + 1);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    // Simulate a network round-trip.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const request = requestsStore.add({ serviceSlug, applicantName: values.fullName });
    setSubmittedId(request.id);
  });

  if (submittedId) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-200 bg-white p-10 text-center">
        <CircleCheck aria-hidden className="size-14 text-brand-600" />
        <h2 className="text-xl font-bold text-ink-900" tabIndex={-1} ref={(el) => el?.focus()}>
          {dict.wizard.success.title}
        </h2>
        <p className="max-w-md text-ink-500">{t(dict.wizard.success.body, { id: submittedId })}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href={`/${lang}/requests`} className={buttonClasses()}>
            {dict.wizard.success.track}
          </Link>
          <Link href={`/${lang}#catalog`} className={buttonClasses({ variant: "secondary" })}>
            {dict.wizard.success.home}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink-900">
          {t(dict.wizard.title, { service: serviceTitle })}
        </h1>
      </div>

      <Stepper
        steps={steps}
        current={step}
        label={t(dict.wizard.stepOf, { current: step + 1, total: steps.length })}
      />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (isLast) void onSubmit(event);
          else void handleNext();
        }}
        className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8"
      >
        <p className="text-xs font-semibold text-brand-700">
          {t(dict.wizard.stepOf, { current: step + 1, total: steps.length })}
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-1 mb-6 text-lg font-bold text-ink-900 focus:outline-none"
        >
          {steps[step]}
        </h2>

        {step === 0 && <ApplicantStep form={form} dict={dict} />}
        {step === 1 && <DetailsStep form={form} dict={dict} />}
        {step === 2 && <AttachmentsStep form={form} dict={dict} />}
        {step === 3 && (
          <ReviewStep form={form} dict={dict} lang={lang} steps={steps} onEdit={goTo} />
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => goTo(step - 1)}>
              <ArrowLeft aria-hidden className="rtl-flip size-4" />
              {dict.wizard.back}
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {isLast
              ? form.formState.isSubmitting
                ? dict.wizard.submitting
                : dict.wizard.submit
              : dict.wizard.next}
            {!isLast && <ArrowRight aria-hidden className="rtl-flip size-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface StepProps {
  form: UseFormReturn<ApplicationValues>;
  dict: WizardDictionary;
}

function errorText(
  errors: FieldErrors<ApplicationValues>,
  name: keyof ApplicationValues,
  dict: WizardDictionary,
) {
  const key = errors[name]?.message as ErrorKey | undefined;
  return key ? (dict.errors[key] ?? key) : undefined;
}

function ApplicantStep({ form, dict }: StepProps) {
  const { register, formState } = form;
  const f = dict.wizard.fields;
  const err = (name: keyof ApplicationValues) => errorText(formState.errors, name, dict);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id="fullName" label={f.fullName} error={err("fullName")} required>
          <Input
            id="fullName"
            autoComplete="name"
            invalid={!!err("fullName")}
            aria-describedby={describedBy("fullName", { error: err("fullName") })}
            {...register("fullName")}
          />
        </Field>
      </div>
      <Field
        id="nationalId"
        label={f.nationalId}
        hint={f.nationalIdHint}
        error={err("nationalId")}
        required
      >
        <Input
          id="nationalId"
          inputMode="numeric"
          dir="ltr"
          maxLength={10}
          invalid={!!err("nationalId")}
          aria-describedby={describedBy("nationalId", {
            hint: f.nationalIdHint,
            error: err("nationalId"),
          })}
          {...register("nationalId")}
        />
      </Field>
      <Field id="mobile" label={f.mobile} hint={f.mobileHint} error={err("mobile")} required>
        <Input
          id="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          maxLength={10}
          invalid={!!err("mobile")}
          aria-describedby={describedBy("mobile", { hint: f.mobileHint, error: err("mobile") })}
          {...register("mobile")}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field id="email" label={f.email} error={err("email")} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            invalid={!!err("email")}
            aria-describedby={describedBy("email", { error: err("email") })}
            {...register("email")}
          />
        </Field>
      </div>
    </div>
  );
}

function DetailsStep({ form, dict }: StepProps) {
  const { register, formState } = form;
  const f = dict.wizard.fields;
  const err = (name: keyof ApplicationValues) => errorText(formState.errors, name, dict);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field id="entityName" label={f.entityName} error={err("entityName")} required>
          <Input
            id="entityName"
            invalid={!!err("entityName")}
            aria-describedby={describedBy("entityName", { error: err("entityName") })}
            {...register("entityName")}
          />
        </Field>
      </div>
      <Field id="city" label={f.city} error={err("city")} required>
        <Select
          id="city"
          defaultValue=""
          invalid={!!err("city")}
          aria-describedby={describedBy("city", { error: err("city") })}
          {...register("city")}
        >
          <option value="" disabled>
            {f.cityPlaceholder}
          </option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {dict.wizard.cities[city]}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="startDate" label={f.startDate} error={err("startDate")} required>
        <Input
          id="startDate"
          type="date"
          min={todayISO()}
          invalid={!!err("startDate")}
          aria-describedby={describedBy("startDate", { error: err("startDate") })}
          {...register("startDate")}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          id="description"
          label={f.description}
          hint={f.descriptionHint}
          error={err("description")}
          required
        >
          <Textarea
            id="description"
            invalid={!!err("description")}
            aria-describedby={describedBy("description", {
              hint: f.descriptionHint,
              error: err("description"),
            })}
            {...register("description")}
          />
        </Field>
      </div>
    </div>
  );
}

function AttachmentsStep({ form, dict }: StepProps) {
  const { control, setValue, formState } = form;
  const inputId = useId();
  const files = useWatch({ control, name: "attachments" }) ?? [];
  const f = dict.wizard.fields;

  // Field-level error, or the first per-file error (type/size).
  const listError = formState.errors.attachments;
  const fileErrors = Array.isArray(listError) ? listError : [];
  const firstFileError = fileErrors.find(Boolean);
  const key = (listError?.message ??
    firstFileError?.size?.message ??
    firstFileError?.type?.message) as ErrorKey | undefined;
  const error = key ? dict.errors[key] : undefined;

  const update = (next: ApplicationValues["attachments"]) =>
    setValue("attachments", next, { shouldValidate: true, shouldDirty: true });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []).map(({ name, size, type }) => ({
      name,
      size,
      type,
    }));
    update([...files, ...picked]);
    event.target.value = "";
  };

  return (
    <Field id={inputId} label={f.attachments} hint={f.attachmentsHint} error={error} required>
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors focus-within:border-brand-500",
          error
            ? "border-danger-500 bg-danger-50"
            : "border-ink-200 hover:border-brand-500 hover:bg-brand-50",
        )}
      >
        <Upload aria-hidden className="size-7 text-brand-600" />
        <span className="text-sm font-semibold text-brand-700">{f.chooseFiles}</span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(",")}
          className="sr-only"
          aria-describedby={describedBy(inputId, { hint: f.attachmentsHint, error })}
          onChange={onChange}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm",
                fileErrors[index] ? "border-danger-500 bg-danger-50" : "border-ink-200",
              )}
            >
              <FileText aria-hidden className="size-4 shrink-0 text-ink-500" />
              <span className="flex-1 truncate [unicode-bidi:plaintext] ltr:text-left rtl:text-right">
                {file.name}
              </span>
              <span className="text-xs text-ink-500" dir="ltr">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => update(files.filter((_, i) => i !== index))}
                aria-label={t(f.removeFile, { name: file.name })}
                className="rounded p-1 text-ink-500 hover:bg-ink-100 hover:text-danger-600"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}

function ReviewStep({
  form,
  dict,
  lang,
  steps,
  onEdit,
}: StepProps & { lang: Locale; steps: string[]; onEdit: (step: number) => void }) {
  const { getValues, register, formState } = form;
  const values = getValues();
  const f = dict.wizard.fields;
  const declarationError = errorText(formState.errors, "declaration", dict);

  const sections: { step: number; rows: [string, string][] }[] = [
    {
      step: 0,
      rows: [
        [f.fullName, values.fullName],
        [f.nationalId, values.nationalId],
        [f.mobile, values.mobile],
        [f.email, values.email],
      ],
    },
    {
      step: 1,
      rows: [
        [f.entityName, values.entityName],
        [f.city, values.city ? dict.wizard.cities[values.city] : ""],
        [f.startDate, values.startDate ? formatDate(values.startDate, lang) : ""],
        [f.description, values.description],
      ],
    },
    {
      step: 2,
      rows: [
        [
          f.attachments,
          (values.attachments ?? []).map((file) => file.name).join(lang === "ar" ? "، " : ", "),
        ],
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-ink-500">{dict.wizard.review.intro}</p>
      {sections.map((section) => (
        <section key={section.step} className="rounded-xl border border-ink-200">
          <header className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <h3 className="text-sm font-bold text-ink-900">{steps[section.step]}</h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
            >
              <Pencil aria-hidden className="size-3.5" />
              {dict.wizard.review.edit}
            </button>
          </header>
          <dl className="divide-y divide-ink-100">
            {section.rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-3">
                <dt className="text-ink-500">{label}</dt>
                <dd className="font-medium break-words text-ink-900 [unicode-bidi:plaintext] sm:col-span-2 ltr:text-left rtl:text-right">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-800">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-brand-600"
            aria-invalid={!!declarationError || undefined}
            aria-describedby={declarationError ? "declaration-error" : undefined}
            {...register("declaration")}
          />
          {f.declaration}
        </label>
        {declarationError && (
          <p
            id="declaration-error"
            role="alert"
            className="mt-1.5 text-xs font-medium text-danger-600"
          >
            {declarationError}
          </p>
        )}
      </div>
    </div>
  );
}
