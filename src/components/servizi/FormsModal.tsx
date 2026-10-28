import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  formatRTOOptionLabel,
  getNextRTOEvent,
  getRTOCalendar,
  giustificaFormSchema,
} from "@/lib/utils/services";
import { cn } from "@/lib/utils/cn";
import type { GiustificaFormPayload, RTOEvent } from "@/types/services";

export interface FormsModalProps {
  rtoEvents?: RTOEvent[];
  defaultEventLabel?: string;
}

const SPECIAL_EVENT_OPTION = "Altra riunione o convocazione tecnica sezionale";

export default function FormsModal({
  rtoEvents,
  defaultEventLabel,
}: FormsModalProps) {
  const calendarEvents =
    rtoEvents && rtoEvents.length > 0 ? rtoEvents : getRTOCalendar();
  const fallbackDefaultEvent =
    defaultEventLabel ?? formatRTOOptionLabel(getNextRTOEvent());

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<GiustificaFormPayload>({
    cognome: "",
    nome: "",
    email: "",
    meccanografico: "",
    numeroTessera: "",
    luogoNascita: "",
    dataNascita: "",
    evento: fallbackDefaultEvent,
    motivo: "",
    privacy: false,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof GiustificaFormPayload, string>>
  >({});
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      window.localStorage.removeItem("aia_ag_referee_profile_v1");
    } catch {
      void 0;
    }
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>(
        '[data-open-modal="giustificazioni"]',
      );
      if (!trigger) return;

      event.preventDefault();
      lastTriggerRef.current = trigger;
      const requestedEvent = trigger.getAttribute("data-rto-event");

      setSubmitStatus("idle");
      setServerMessage("");
      setFieldErrors({});
      if (requestedEvent) {
        setFormData((prev) => ({ ...prev, evento: requestedEvent }));
      }
      setIsOpen(true);
    };

    const handleCustomOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{
        modal?: string;
        rtoEvent?: string;
      }>;
      if (
        customEvent.detail?.modal &&
        customEvent.detail.modal !== "giustificazioni"
      ) {
        return;
      }
      setSubmitStatus("idle");
      setServerMessage("");
      setFieldErrors({});
      if (customEvent.detail?.rtoEvent) {
        setFormData((prev) => ({
          ...prev,
          evento: customEvent.detail.rtoEvent!,
        }));
      }
      setIsOpen(true);
    };

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("aia:open-modal", handleCustomOpen);

    if (window.location.hash === "#giustificazioni") {
      setIsOpen(true);
    }

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("aia:open-modal", handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const scrollY = window.scrollY;
    const originalBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0px";
    document.body.style.right = "0px";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        lastTriggerRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.position = originalBodyStyle.position;
      document.body.style.top = originalBodyStyle.top;
      document.body.style.left = originalBodyStyle.left;
      document.body.style.right = originalBodyStyle.right;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.overflow = originalBodyStyle.overflow;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    lastTriggerRef.current?.focus();
  };

  const updateField = <K extends keyof GiustificaFormPayload>(
    key: K,
    value: GiustificaFormPayload[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerMessage("");

    const validation = giustificaFormSchema.safeParse(formData);
    if (!validation.success) {
      const nextErrors: Partial<Record<keyof GiustificaFormPayload, string>> =
        {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof GiustificaFormPayload | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      setSubmitStatus("error");
      setServerMessage(
        "Controlla i campi evidenziati in rosso prima di inviare la giustificazione.",
      );
      return;
    }

    setFieldErrors({});
    setSubmitStatus("submitting");

    try {
      const response = await fetch("/api/forms/giustificazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: Partial<Record<keyof GiustificaFormPayload, string>>;
      } | null;

      if (!response.ok || !result?.ok) {
        if (result?.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        setSubmitStatus("error");
        setServerMessage(
          result?.error ??
            "Non è stato possibile inviare la giustificazione. Verifica i dati e riprova.",
        );
        return;
      }

      setSubmitStatus("success");
      setServerMessage(
        result.message ??
          "Giustificazione registrata con successo. Una copia di riepilogo è stata inviata al tuo indirizzo email.",
      );
    } catch {
      setSubmitStatus("error");
      setServerMessage(
        "Errore di connessione durante l'invio. Puoi riprovare o inviare la giustificazione a giustificazionirto@aiaagrigento.it.",
      );
    }
  };

  const eventOptions = calendarEvents.map((ev) => formatRTOOptionLabel(ev));

  return (
    <div
      ref={dialogRef}
      id="rto-giustificazioni-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="giustificazioni-modal-title"
      aria-describedby="giustificazioni-modal-subtitle"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4",
        isOpen
          ? "pointer-events-auto visible"
          : "pointer-events-none invisible",
      )}
    >
      <div
        onClick={closeModal}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-sm border border-slate-200 bg-white shadow-xl transition-transform duration-200 sm:max-h-[88vh] sm:rounded-sm",
          isOpen
            ? "translate-y-0"
            : "translate-y-full sm:translate-y-4 sm:scale-[0.99]",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-blue-900/30 bg-[#004b97] px-5 py-4 sm:px-6">
          <div>
            <h2
              id="giustificazioni-modal-title"
              className="font-heading mt-0.5 text-lg leading-snug font-bold tracking-tight text-white sm:text-xl"
            >
              Giustificazione Assenza Riunione Tecnica Obbligatoria
            </h2>
            <p
              id="giustificazioni-modal-subtitle"
              className="mt-1 font-sans text-xs text-blue-100"
            >
              I dati saranno trasmessi direttamente alla Segreteria Sezionale.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeModal}
            aria-label="Chiudi modulo giustificazione assenza"
            className="focus-visible:outline-referee-gold inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-sm text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
          {submitStatus === "success" ? (
            <div className="py-6 text-left">
              <span className="font-heading inline-flex items-center text-xs font-bold tracking-wider text-emerald-800 uppercase">
                Trasmissione Completata
              </span>
              <h3 className="font-heading mt-2 text-xl font-bold tracking-tight text-slate-900">
                Giustificazione registrata con successo
              </h3>
              <p className="mt-2 max-w-prose font-sans text-sm leading-relaxed text-slate-700">
                {serverMessage}
              </p>

              <dl className="mt-5 grid grid-cols-1 gap-3 rounded-sm border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-heading font-semibold text-slate-500 uppercase">
                    Associato
                  </dt>
                  <dd className="mt-0.5 font-sans font-bold text-slate-900">
                    {formData.cognome} {formData.nome} (Mecc.{" "}
                    {formData.meccanografico})
                  </dd>
                </div>
                <div>
                  <dt className="font-heading font-semibold text-slate-500 uppercase">
                    Riunione Giustificata
                  </dt>
                  <dd className="mt-0.5 font-sans font-bold text-slate-900">
                    {formData.evento}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitStatus("idle");
                    setServerMessage("");
                    setFormData({
                      cognome: "",
                      nome: "",
                      email: "",
                      meccanografico: "",
                      numeroTessera: "",
                      luogoNascita: "",
                      dataNascita: "",
                      evento: fallbackDefaultEvent,
                      motivo: "",
                      privacy: false,
                    });
                  }}
                  className="font-heading min-h-[48px] w-full cursor-pointer rounded-sm border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-slate-800 uppercase transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  Invia un&apos;altra giustificazione
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="font-heading min-h-[48px] w-full cursor-pointer rounded-sm bg-[#004b97] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-colors hover:bg-blue-800 sm:w-auto"
                >
                  Chiudi finestra
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                    htmlFor="giustifica-cognome"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Cognome *
                  </label>
                  <input
                    id="giustifica-cognome"
                    name="cognome"
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder="Es. Rossi"
                    value={formData.cognome}
                    onChange={(e) => updateField("cognome", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.cognome)}
                    aria-describedby={
                      fieldErrors.cognome
                        ? "giustifica-cognome-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      fieldErrors.cognome
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {fieldErrors.cognome && (
                    <p
                      id="giustifica-cognome-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {fieldErrors.cognome}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="giustifica-nome"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Nome *
                  </label>
                  <input
                    id="giustifica-nome"
                    name="nome"
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="Es. Mario"
                    value={formData.nome}
                    onChange={(e) => updateField("nome", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.nome)}
                    aria-describedby={
                      fieldErrors.nome ? "giustifica-nome-error" : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      fieldErrors.nome
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {fieldErrors.nome && (
                    <p
                      id="giustifica-nome-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {fieldErrors.nome}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="giustifica-email"
                  className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                >
                  Indirizzo Email (registrato su Sinfonia4You) *
                </label>
                <input
                  id="giustifica-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="mario.rossi@email.it"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "giustifica-email-error" : undefined
                  }
                  className={cn(
                    "mt-1.5 block min-h-[44px] w-full max-w-full truncate rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    fieldErrors.email
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {fieldErrors.email && (
                  <p
                    id="giustifica-email-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="giustifica-meccanografico"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Codice Meccanografico AIA *
                  </label>
                  <input
                    id="giustifica-meccanografico"
                    name="meccanografico"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="7 cifre (es. 1234567)"
                    value={formData.meccanografico}
                    onChange={(e) =>
                      updateField(
                        "meccanografico",
                        e.target.value.replace(/\D/g, "").slice(0, 8),
                      )
                    }
                    aria-invalid={Boolean(fieldErrors.meccanografico)}
                    aria-describedby={
                      fieldErrors.meccanografico
                        ? "giustifica-meccanografico-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      fieldErrors.meccanografico
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {fieldErrors.meccanografico && (
                    <p
                      id="giustifica-meccanografico-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {fieldErrors.meccanografico}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="giustifica-tessera"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Numero Tessera Federale *
                  </label>
                  <input
                    id="giustifica-tessera"
                    name="numeroTessera"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Solo cifre"
                    value={formData.numeroTessera}
                    onChange={(e) =>
                      updateField(
                        "numeroTessera",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    aria-invalid={Boolean(fieldErrors.numeroTessera)}
                    aria-describedby={
                      fieldErrors.numeroTessera
                        ? "giustifica-tessera-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      fieldErrors.numeroTessera
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {fieldErrors.numeroTessera && (
                    <p
                      id="giustifica-tessera-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {fieldErrors.numeroTessera}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="giustifica-luogo-nascita"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Luogo di Nascita *
                  </label>
                  <input
                    id="giustifica-luogo-nascita"
                    name="luogoNascita"
                    type="text"
                    required
                    placeholder="Es. Agrigento"
                    value={formData.luogoNascita}
                    onChange={(e) =>
                      updateField("luogoNascita", e.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.luogoNascita)}
                    aria-describedby={
                      fieldErrors.luogoNascita
                        ? "giustifica-luogo-nascita-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      fieldErrors.luogoNascita
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {fieldErrors.luogoNascita && (
                    <p
                      id="giustifica-luogo-nascita-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {fieldErrors.luogoNascita}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="giustifica-data-nascita"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Data di Nascita *
                  </label>
                  <input
                    id="giustifica-data-nascita"
                    name="dataNascita"
                    type="date"
                    required
                    value={formData.dataNascita}
                    onChange={(e) => updateField("dataNascita", e.target.value)}
                    aria-invalid={Boolean(fieldErrors.dataNascita)}
                    aria-describedby={
                      fieldErrors.dataNascita
                        ? "giustifica-data-nascita-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      fieldErrors.dataNascita
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {fieldErrors.dataNascita && (
                    <p
                      id="giustifica-data-nascita-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {fieldErrors.dataNascita}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="giustifica-evento"
                  className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                >
                  Riunione Tecnica da Giustificare *
                </label>
                <select
                  id="giustifica-evento"
                  name="evento"
                  required
                  value={formData.evento}
                  onChange={(e) => updateField("evento", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.evento)}
                  aria-describedby={
                    fieldErrors.evento ? "giustifica-evento-error" : undefined
                  }
                  className={cn(
                    "mt-1.5 block min-h-[44px] w-full max-w-full truncate rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    fieldErrors.evento
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                >
                  {eventOptions.map((optionLabel) => (
                    <option key={optionLabel} value={optionLabel}>
                      {optionLabel}
                    </option>
                  ))}
                  <option value={SPECIAL_EVENT_OPTION}>
                    {SPECIAL_EVENT_OPTION}
                  </option>
                </select>
                {fieldErrors.evento && (
                  <p
                    id="giustifica-evento-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {fieldErrors.evento}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="giustifica-motivo"
                  className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                >
                  Motivazione Dettagliata dell&apos;Assenza *
                </label>
                <textarea
                  id="giustifica-motivo"
                  name="motivo"
                  rows={3}
                  required
                  placeholder="Indica la motivazione (Studio, Impegni lavorativi documentati, Motivi di salute o Gara federale concomitante)..."
                  value={formData.motivo}
                  onChange={(e) => updateField("motivo", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.motivo)}
                  aria-describedby={
                    fieldErrors.motivo ? "giustifica-motivo-error" : undefined
                  }
                  className={cn(
                    "mt-1.5 block w-full rounded-sm border bg-white px-3.5 py-2.5 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    fieldErrors.motivo
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {fieldErrors.motivo && (
                  <p
                    id="giustifica-motivo-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {fieldErrors.motivo}
                  </p>
                )}
              </div>

              <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5">
                <label
                  htmlFor="giustifica-privacy"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="giustifica-privacy"
                    name="privacy"
                    type="checkbox"
                    checked={formData.privacy}
                    onChange={(e) => updateField("privacy", e.target.checked)}
                    aria-invalid={Boolean(fieldErrors.privacy)}
                    aria-describedby={
                      fieldErrors.privacy
                        ? "giustifica-privacy-error"
                        : undefined
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-xs border-slate-300 text-[#004b97] focus:ring-[#004b97]"
                  />
                  <span className="font-sans text-xs leading-relaxed text-slate-700">
                    Dichiaro di aver preso visione dell&apos;informativa privacy
                    e acconsento al trattamento dei dati personali ai sensi del
                    GDPR per la gestione dell&apos;assenza alla riunione tecnica
                    sezionale. *
                  </span>
                </label>
                {fieldErrors.privacy && (
                  <p
                    id="giustifica-privacy-error"
                    className="mt-1.5 font-sans text-xs text-red-700"
                  >
                    {fieldErrors.privacy}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={closeModal}
                  className="font-heading min-h-[48px] w-full cursor-pointer rounded-sm border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-slate-700 uppercase transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  Annulla
                </button>

                <button
                  type="submit"
                  disabled={submitStatus === "submitting"}
                  className="bg-referee-gold font-heading min-h-[48px] w-full cursor-pointer rounded-sm px-6 py-3 text-xs font-bold tracking-wider text-slate-950 uppercase shadow-xs transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitStatus === "submitting"
                    ? "Invio in corso..."
                    : "Invia Giustificazione Ufficiale"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
