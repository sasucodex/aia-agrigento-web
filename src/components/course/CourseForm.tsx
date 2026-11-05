import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  buildCourseWhatsAppUrl,
  calculateCandidateAge,
  CourseRegistrationSchema,
  getCourseData,
  getCourseRegistrationSection,
} from "@/lib/utils/course";
import { cn } from "@/lib/utils/cn";
import type {
  CourseDataset,
  CourseRegistrationPayload,
  CourseRegistrationSectionData,
} from "@/types/course";

export interface CourseFormProps {
  course?: CourseDataset;
  sectionData?: CourseRegistrationSectionData;
  sedeImageSrc?: string;
  sedeImageWidth?: number;
  sedeImageHeight?: number;
}

const initialFormState: CourseRegistrationPayload = {
  nome: "",
  cognome: "",
  citta: "",
  dataNascita: "",
  telefono: "",
  email: "",
  privacy: false,
  consensoGenitori: false,
  website: "",
};

export default function CourseForm({
  course = getCourseData(),
  sectionData = getCourseRegistrationSection(),
  sedeImageSrc,
  sedeImageWidth = 1000,
  sedeImageHeight = 700,
}: CourseFormProps) {
  const [formData, setFormData] =
    useState<CourseRegistrationPayload>(initialFormState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseRegistrationPayload, string>>
  >({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");

  const updateField = <K extends keyof CourseRegistrationPayload>(
    key: K,
    value: CourseRegistrationPayload[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const buildPersonalizedWhatsAppUrl = () => {
    const fullName =
      `${formData.nome.trim()} ${formData.cognome.trim()}`.trim();
    const city = formData.citta.trim();
    if (fullName && city) {
      return buildCourseWhatsAppUrl(
        `Ciao! Sono ${fullName} (${city}) e vorrei ricevere informazioni per iscrivermi al prossimo Corso Arbitri gratuito della Sezione AIA di Agrigento.`,
      );
    }
    if (fullName) {
      return buildCourseWhatsAppUrl(
        `Ciao! Sono ${fullName} e vorrei ricevere informazioni per iscrivermi al prossimo Corso Arbitri gratuito della Sezione AIA di Agrigento.`,
      );
    }
    return buildCourseWhatsAppUrl(course.whatsappText);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerMessage("");

    const validation = CourseRegistrationSchema.safeParse(formData);
    if (!validation.success) {
      const nextErrors: Partial<
        Record<keyof CourseRegistrationPayload, string>
      > = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as
          keyof CourseRegistrationPayload | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setErrors(nextErrors);
      setSubmitStatus("error");
      setServerMessage(
        "Controlla i campi evidenziati in rosso prima di inviare la richiesta di iscrizione.",
      );
      return;
    }

    setErrors({});
    setSubmitStatus("submitting");

    const validData = validation.data;

    try {
      const response = await fetch("/api/forms/iscrizione-corso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: Partial<Record<keyof CourseRegistrationPayload, string>>;
      } | null;

      if (!response.ok || !result?.ok) {
        if (result?.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setSubmitStatus("error");
        setServerMessage(
          result?.error ??
            "Non è stato possibile inviare la richiesta. Verifica i dati inseriti o contattaci su WhatsApp.",
        );
        return;
      }

      setSubmitStatus("success");
      setServerMessage(result.message ?? sectionData.successMessage);
    } catch {
      setSubmitStatus("error");
      setServerMessage(
        "Errore di connessione durante l'invio. Puoi riprovare oppure scriverci direttamente su WhatsApp.",
      );
    }
  };

  const personalizedWhatsAppUrl = buildPersonalizedWhatsAppUrl();

  return (
    <section
      id="modulo-iscrizione"
      aria-labelledby="course-registration-heading"
      className="scroll-mt-20 border-b border-slate-200/80 bg-slate-50 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {sectionData.kicker && (
          <span className="font-heading text-referee-gold mb-2 block text-center text-xs font-semibold tracking-widest uppercase sm:mb-3">
            {sectionData.kicker}
          </span>
        )}

        <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-4">
          <div
            className="h-[2px] min-w-5 flex-1 shrink-0 bg-[#004b97] sm:min-w-8"
            aria-hidden="true"
          />
          <h2
            id="course-registration-heading"
            className="font-heading text-center text-xl font-extrabold tracking-tight text-balance text-slate-900 uppercase sm:text-2xl lg:text-3xl"
          >
            {sectionData.title}
          </h2>
          <div
            className="h-[2px] min-w-5 flex-1 shrink-0 bg-[#004b97] sm:min-w-8"
            aria-hidden="true"
          />
        </div>

        <p className="mx-auto mb-10 max-w-3xl text-center font-sans text-base leading-relaxed text-pretty text-slate-700 sm:mb-12">
          {sectionData.lead}
        </p>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-heading text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Modulo di Iscrizione
                </h3>
              </div>

              {submitStatus === "success" ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="py-4 text-left"
                >
                  <span className="font-heading inline-flex items-center text-xs font-bold tracking-wider text-emerald-800 uppercase">
                    Candidatura Registrata
                  </span>
                  <h4 className="font-heading mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    {sectionData.successTitle}
                  </h4>
                  <p className="mt-2 max-w-prose font-sans text-sm leading-relaxed text-slate-700 sm:text-base">
                    {serverMessage}
                  </p>

                  <dl className="mt-5 grid grid-cols-1 gap-3 rounded-sm border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-heading font-semibold text-slate-500 uppercase">
                        Cognome
                      </dt>
                      <dd className="mt-0.5 font-sans font-bold text-slate-900">
                        {formData.cognome}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-heading font-semibold text-slate-500 uppercase">
                        Nome
                      </dt>
                      <dd className="mt-0.5 font-sans font-bold text-slate-900">
                        {formData.nome}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-heading font-semibold text-slate-500 uppercase">
                        Comune di Residenza
                      </dt>
                      <dd className="mt-0.5 font-sans font-bold text-slate-900">
                        {formData.citta}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-heading font-semibold text-slate-500 uppercase">
                        Data di Nascita
                      </dt>
                      <dd className="mt-0.5 font-sans font-bold text-slate-900 tabular-nums">
                        {formData.dataNascita}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-heading font-semibold text-slate-500 uppercase">
                        Recapito Telefonico
                      </dt>
                      <dd className="mt-0.5 font-sans font-bold text-slate-900 tabular-nums">
                        {formData.telefono}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-heading font-semibold text-slate-500 uppercase">
                        Indirizzo Email
                      </dt>
                      <dd className="mt-0.5 truncate font-sans font-bold text-slate-900">
                        {formData.email}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a
                      href={personalizedWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-heading inline-flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-emerald-600 px-5 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
                    >
                      <span>Avvisa anche su WhatsApp</span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData(initialFormState);
                        setErrors({});
                        setSubmitStatus("idle");
                        setServerMessage("");
                      }}
                      className="font-heading inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-sm border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-wider text-slate-800 uppercase transition-colors hover:bg-slate-50"
                    >
                      Compila una nuova richiesta
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div style={{ display: "none" }} aria-hidden="true">
                    <label htmlFor="course-website">Website</label>
                    <input
                      id="course-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website ?? ""}
                      onChange={(e) => updateField("website", e.target.value)}
                    />
                  </div>

                  {submitStatus === "error" && serverMessage && (
                    <div
                      role="alert"
                      className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 font-sans text-xs font-medium text-red-900"
                    >
                      {serverMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="course-cognome"
                        className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                      >
                        Cognome *
                      </label>
                      <input
                        id="course-cognome"
                        name="cognome"
                        type="text"
                        required
                        autoComplete="family-name"
                        placeholder="Es. Rossi"
                        value={formData.cognome}
                        onChange={(e) => updateField("cognome", e.target.value)}
                        aria-invalid={Boolean(errors.cognome)}
                        aria-describedby={
                          errors.cognome ? "course-cognome-error" : undefined
                        }
                        className={cn(
                          "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                          errors.cognome
                            ? "border-red-500 bg-red-50/30"
                            : "border-slate-300",
                        )}
                      />
                      {errors.cognome && (
                        <p
                          id="course-cognome-error"
                          className="mt-1 font-sans text-xs text-red-700"
                        >
                          {errors.cognome}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="course-nome"
                        className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                      >
                        Nome *
                      </label>
                      <input
                        id="course-nome"
                        name="nome"
                        type="text"
                        required
                        autoComplete="given-name"
                        placeholder="Es. Mario"
                        value={formData.nome}
                        onChange={(e) => updateField("nome", e.target.value)}
                        aria-invalid={Boolean(errors.nome)}
                        aria-describedby={
                          errors.nome ? "course-nome-error" : undefined
                        }
                        className={cn(
                          "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                          errors.nome
                            ? "border-red-500 bg-red-50/30"
                            : "border-slate-300",
                        )}
                      />
                      {errors.nome && (
                        <p
                          id="course-nome-error"
                          className="mt-1 font-sans text-xs text-red-700"
                        >
                          {errors.nome}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="course-citta"
                        className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                      >
                        Città di Residenza *
                      </label>
                      <input
                        id="course-citta"
                        name="citta"
                        type="text"
                        required
                        autoComplete="address-level2"
                        placeholder="Es. Agrigento, Favara, Canicattì, Sciacca..."
                        value={formData.citta}
                        onChange={(e) => updateField("citta", e.target.value)}
                        aria-invalid={Boolean(errors.citta)}
                        aria-describedby={
                          errors.citta ? "course-citta-error" : undefined
                        }
                        className={cn(
                          "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                          errors.citta
                            ? "border-red-500 bg-red-50/30"
                            : "border-slate-300",
                        )}
                      />
                      {errors.citta && (
                        <p
                          id="course-citta-error"
                          className="mt-1 font-sans text-xs text-red-700"
                        >
                          {errors.citta}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="course-data-nascita"
                        className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                      >
                        Data di Nascita (14–39 anni) *
                      </label>
                      <input
                        id="course-data-nascita"
                        name="dataNascita"
                        type="date"
                        required
                        autoComplete="bday"
                        value={formData.dataNascita}
                        onChange={(e) =>
                          updateField("dataNascita", e.target.value)
                        }
                        aria-invalid={Boolean(errors.dataNascita)}
                        aria-describedby={
                          errors.dataNascita
                            ? "course-data-nascita-error"
                            : undefined
                        }
                        className={cn(
                          "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                          errors.dataNascita
                            ? "border-red-500 bg-red-50/30"
                            : "border-slate-300",
                        )}
                      />
                      {errors.dataNascita && (
                        <p
                          id="course-data-nascita-error"
                          className="mt-1 font-sans text-xs text-red-700"
                        >
                          {errors.dataNascita}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="course-telefono"
                        className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                      >
                        Recapito Telefonico / Cellulare *
                      </label>
                      <input
                        id="course-telefono"
                        name="telefono"
                        type="tel"
                        inputMode="tel"
                        required
                        autoComplete="tel"
                        placeholder="Es. 392 1234567"
                        value={formData.telefono}
                        onChange={(e) =>
                          updateField("telefono", e.target.value)
                        }
                        aria-invalid={Boolean(errors.telefono)}
                        aria-describedby={
                          errors.telefono ? "course-telefono-error" : undefined
                        }
                        className={cn(
                          "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                          errors.telefono
                            ? "border-red-500 bg-red-50/30"
                            : "border-slate-300",
                        )}
                      />
                      {errors.telefono && (
                        <p
                          id="course-telefono-error"
                          className="mt-1 font-sans text-xs text-red-700"
                        >
                          {errors.telefono}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="course-email"
                        className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                      >
                        Indirizzo Email *
                      </label>
                      <input
                        id="course-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        required
                        autoComplete="email"
                        placeholder="mario.rossi@email.it"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? "course-email-error" : undefined
                        }
                        className={cn(
                          "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                          errors.email
                            ? "border-red-500 bg-red-50/30"
                            : "border-slate-300",
                        )}
                      />
                      {errors.email && (
                        <p
                          id="course-email-error"
                          className="mt-1 font-sans text-xs text-red-700"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-sm border border-slate-200 bg-slate-50 p-3.5">
                    <div>
                      <label
                        htmlFor="course-privacy"
                        className="flex cursor-pointer items-start gap-3 select-none"
                      >
                        <input
                          id="course-privacy"
                          name="privacy"
                          type="checkbox"
                          checked={formData.privacy}
                          onChange={(e) =>
                            updateField("privacy", e.target.checked)
                          }
                          aria-invalid={Boolean(errors.privacy)}
                          aria-describedby={
                            errors.privacy ? "course-privacy-error" : undefined
                          }
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded-xs border-slate-300 accent-[#004b97]"
                        />
                        <span className="font-sans text-xs leading-relaxed text-slate-700">
                          Ho letto e compreso l&apos;
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-referee-gold font-medium text-[#004b97] underline underline-offset-2"
                          >
                            Informativa sulla Privacy
                          </a>{" "}
                          (Art. 13 GDPR) e chiedo di essere ricontattato per la
                          candidatura preliminare al Corso Arbitri della Sezione
                          AIA di Agrigento (Art. 6, par. 1, lett. b GDPR). *
                        </span>
                      </label>
                      {errors.privacy && (
                        <p
                          id="course-privacy-error"
                          className="mt-1.5 font-sans text-xs text-red-700"
                        >
                          {errors.privacy}
                        </p>
                      )}
                    </div>

                    {(() => {
                      const candidateAge = calculateCandidateAge(
                        formData.dataNascita,
                      );
                      const isMinor =
                        candidateAge !== null &&
                        candidateAge >= 14 &&
                        candidateAge < 18;
                      if (!isMinor) return null;
                      return (
                        <div className="border-t border-slate-200 pt-3">
                          <label
                            htmlFor="course-consenso-genitori"
                            className="flex cursor-pointer items-start gap-3 select-none"
                          >
                            <input
                              id="course-consenso-genitori"
                              name="consensoGenitori"
                              type="checkbox"
                              checked={Boolean(formData.consensoGenitori)}
                              onChange={(e) =>
                                updateField(
                                  "consensoGenitori",
                                  e.target.checked,
                                )
                              }
                              aria-invalid={Boolean(errors.consensoGenitori)}
                              aria-describedby={
                                errors.consensoGenitori
                                  ? "course-consenso-genitori-error"
                                  : undefined
                              }
                              className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded-xs border-slate-300 accent-[#004b97]"
                            />
                            <span className="font-sans text-xs leading-relaxed text-slate-700">
                              Essendo minorenne (14–17 anni), dichiaro che
                              l&apos;esercente la responsabilità genitoriale è
                              informato della presente candidatura preliminare e
                              ha preso visione dell&apos;Informativa Privacy. *
                            </span>
                          </label>
                          {errors.consensoGenitori && (
                            <p
                              id="course-consenso-genitori-error"
                              className="mt-1.5 font-sans text-xs text-red-700"
                            >
                              {errors.consensoGenitori}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {sectionData.minorsNotice && (
                    <div className="rounded-sm border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-sans text-xs leading-relaxed text-slate-600">
                      {sectionData.minorsNotice}
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4">
                    <button
                      type="submit"
                      disabled={submitStatus === "submitting"}
                      className="bg-referee-gold font-heading inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-sm px-8 py-3.5 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-xs transition-all duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
                    >
                      {submitStatus === "submitting"
                        ? "Invio in corso..."
                        : sectionData.submitLabel}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex flex-col justify-between rounded-sm border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div>
                <h3 className="font-heading mb-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {sectionData.whatsappBoxTitle}
                </h3>
                <p className="mb-6 font-sans text-sm leading-relaxed text-pretty text-slate-700">
                  {sectionData.whatsappBoxDescription}
                </p>
              </div>

              <a
                href={personalizedWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-heading inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-sm bg-emerald-600 px-6 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-xs transition-all duration-200 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:scale-[0.98] sm:text-sm"
              >
                <span>{sectionData.whatsappButtonLabel}</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            </div>

            {sedeImageSrc && (
              <figure className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-xs">
                <img
                  src={sedeImageSrc}
                  alt="Aula della Sezione AIA di Agrigento in Via Matteo Cimarra 38 durante una lezione tecnica"
                  width={sedeImageWidth}
                  height={sedeImageHeight}
                  loading="lazy"
                  decoding="async"
                  className="aspect-10/7 h-auto w-full object-cover"
                />
                <figcaption className="border-t border-slate-100 px-4 py-3 text-center font-sans text-xs text-slate-600">
                  {sectionData.sedeCaption}
                </figcaption>
              </figure>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
