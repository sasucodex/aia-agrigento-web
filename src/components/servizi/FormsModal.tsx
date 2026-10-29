import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import {
  accreditoFormSchema,
  formatRTOOptionLabel,
  getNextRTOEvent,
  giustificaFormSchema,
  RTO_SPECIAL_EVENT_OPTION,
} from "@/lib/utils/services";
import { cn } from "@/lib/utils/cn";
import type {
  AccreditoFormPayload,
  GiustificaFormPayload,
} from "@/types/services";

export type ActiveModalType = "giustificazioni" | "accrediti";

export interface FormsModalProps {
  defaultEventLabel?: string;
}

const PROFILE_STORAGE_KEY = "aia_ag_referee_profile_v1";

interface StoredRefereeProfile {
  cognome: string;
  nome: string;
  email: string;
  meccanografico: string;
  numeroTessera: string;
  luogoNascita: string;
  dataNascita: string;
}

export default function FormsModal({ defaultEventLabel }: FormsModalProps) {
  const fallbackDefaultEvent =
    defaultEventLabel ?? formatRTOOptionLabel(getNextRTOEvent());
  const eventOptions = [fallbackDefaultEvent, RTO_SPECIAL_EVENT_OPTION];
  const resolveEventOption = (requested?: string | null) =>
    requested && eventOptions.includes(requested)
      ? requested
      : fallbackDefaultEvent;

  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] =
    useState<ActiveModalType>("giustificazioni");

  const [giustificaData, setGiustificaData] = useState<GiustificaFormPayload>({
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

  const [accreditoData, setAccreditoData] = useState<AccreditoFormPayload>({
    cognome: "",
    nome: "",
    email: "",
    meccanografico: "",
    numeroTessera: "",
    luogoNascita: "",
    dataNascita: "",
    partita: "",
    note: "",
    privacy: false,
  });

  const [giustificaErrors, setGiustificaErrors] = useState<
    Partial<Record<keyof GiustificaFormPayload, string>>
  >({});
  const [accreditoErrors, setAccreditoErrors] = useState<
    Partial<Record<keyof AccreditoFormPayload, string>>
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
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<StoredRefereeProfile>;
      const profilePatch: StoredRefereeProfile = {
        cognome: typeof saved.cognome === "string" ? saved.cognome : "",
        nome: typeof saved.nome === "string" ? saved.nome : "",
        email: typeof saved.email === "string" ? saved.email : "",
        meccanografico:
          typeof saved.meccanografico === "string" ? saved.meccanografico : "",
        numeroTessera:
          typeof saved.numeroTessera === "string" ? saved.numeroTessera : "",
        luogoNascita:
          typeof saved.luogoNascita === "string" ? saved.luogoNascita : "",
        dataNascita:
          typeof saved.dataNascita === "string" ? saved.dataNascita : "",
      };
      setGiustificaData((prev) => ({ ...prev, ...profilePatch }));
      setAccreditoData((prev) => ({ ...prev, ...profilePatch }));
    } catch {
      void 0;
    }
  }, []);

  const persistProfile = (profile: StoredRefereeProfile) => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      void 0;
    }
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trigger = target?.closest<HTMLElement>("[data-open-modal]");
      if (!trigger) return;

      const modalTypeAttr = trigger.getAttribute("data-open-modal");
      if (
        modalTypeAttr !== "giustificazioni" &&
        modalTypeAttr !== "accrediti"
      ) {
        return;
      }

      event.preventDefault();
      lastTriggerRef.current = trigger;

      setSubmitStatus("idle");
      setServerMessage("");
      setGiustificaErrors({});
      setAccreditoErrors({});
      setActiveModal(modalTypeAttr);

      if (modalTypeAttr === "giustificazioni") {
        const requestedEvent = resolveEventOption(
          trigger.getAttribute("data-rto-event"),
        );
        setGiustificaData((prev) => ({ ...prev, evento: requestedEvent }));
      }

      setIsOpen(true);
    };

    const handleCustomOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{
        modal?: string;
        rtoEvent?: string;
      }>;
      const requestedModal = customEvent.detail?.modal;
      const targetModal: ActiveModalType =
        requestedModal === "accrediti" ? "accrediti" : "giustificazioni";

      setSubmitStatus("idle");
      setServerMessage("");
      setGiustificaErrors({});
      setAccreditoErrors({});
      setActiveModal(targetModal);

      if (targetModal === "giustificazioni") {
        const requestedEvent = resolveEventOption(customEvent.detail?.rtoEvent);
        setGiustificaData((prev) => ({ ...prev, evento: requestedEvent }));
      }
      setIsOpen(true);
    };

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("aia:open-modal", handleCustomOpen);

    if (window.location.hash === "#giustificazioni") {
      setActiveModal("giustificazioni");
      setIsOpen(true);
    } else if (window.location.hash === "#accrediti") {
      setActiveModal("accrediti");
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

  const updateGiustificaField = <K extends keyof GiustificaFormPayload>(
    key: K,
    value: GiustificaFormPayload[K],
  ) => {
    setGiustificaData((prev) => ({ ...prev, [key]: value }));
    if (giustificaErrors[key]) {
      setGiustificaErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const updateAccreditoField = <K extends keyof AccreditoFormPayload>(
    key: K,
    value: AccreditoFormPayload[K],
  ) => {
    setAccreditoData((prev) => ({ ...prev, [key]: value }));
    if (accreditoErrors[key]) {
      setAccreditoErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleGiustificaSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setServerMessage("");

    const validation = giustificaFormSchema.safeParse(giustificaData);
    if (!validation.success) {
      const nextErrors: Partial<Record<keyof GiustificaFormPayload, string>> =
        {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof GiustificaFormPayload | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setGiustificaErrors(nextErrors);
      setSubmitStatus("error");
      setServerMessage(
        "Controlla i campi evidenziati in rosso prima di inviare la giustificazione.",
      );
      return;
    }

    setGiustificaErrors({});
    setSubmitStatus("submitting");

    const validData = validation.data;
    persistProfile({
      cognome: validData.cognome,
      nome: validData.nome,
      email: validData.email,
      meccanografico: validData.meccanografico,
      numeroTessera: validData.numeroTessera,
      luogoNascita: validData.luogoNascita,
      dataNascita: validData.dataNascita,
    });
    setAccreditoData((prev) => ({
      ...prev,
      cognome: validData.cognome,
      nome: validData.nome,
      email: validData.email,
      meccanografico: validData.meccanografico,
      numeroTessera: validData.numeroTessera,
      luogoNascita: validData.luogoNascita,
      dataNascita: validData.dataNascita,
    }));

    try {
      const response = await fetch("/api/forms/giustificazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: Partial<Record<keyof GiustificaFormPayload, string>>;
      } | null;

      if (!response.ok || !result?.ok) {
        if (result?.fieldErrors) {
          setGiustificaErrors(result.fieldErrors);
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

  const handleAccreditoSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setServerMessage("");

    const validation = accreditoFormSchema.safeParse(accreditoData);
    if (!validation.success) {
      const nextErrors: Partial<Record<keyof AccreditoFormPayload, string>> =
        {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof AccreditoFormPayload | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setAccreditoErrors(nextErrors);
      setSubmitStatus("error");
      setServerMessage(
        "Controlla i campi evidenziati in rosso prima di inviare la richiesta di accredito.",
      );
      return;
    }

    setAccreditoErrors({});
    setSubmitStatus("submitting");

    const validData = validation.data;
    persistProfile({
      cognome: validData.cognome,
      nome: validData.nome,
      email: validData.email,
      meccanografico: validData.meccanografico,
      numeroTessera: validData.numeroTessera,
      luogoNascita: validData.luogoNascita,
      dataNascita: validData.dataNascita,
    });
    setGiustificaData((prev) => ({
      ...prev,
      cognome: validData.cognome,
      nome: validData.nome,
      email: validData.email,
      meccanografico: validData.meccanografico,
      numeroTessera: validData.numeroTessera,
      luogoNascita: validData.luogoNascita,
      dataNascita: validData.dataNascita,
    }));

    try {
      const response = await fetch("/api/forms/accrediti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validData),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: Partial<Record<keyof AccreditoFormPayload, string>>;
      } | null;

      if (!response.ok || !result?.ok) {
        if (result?.fieldErrors) {
          setAccreditoErrors(result.fieldErrors);
        }
        setSubmitStatus("error");
        setServerMessage(
          result?.error ??
            "Non è stato possibile inviare la richiesta di accredito. Verifica i dati e riprova.",
        );
        return;
      }

      setSubmitStatus("success");
      setServerMessage(
        result.message ??
          "Richiesta di accredito presa in carico e trasmessa a accrediti@aiaagrigento.it.",
      );
    } catch {
      setSubmitStatus("error");
      setServerMessage(
        "Errore di connessione durante l'invio. Puoi riprovare o scrivere direttamente a accrediti@aiaagrigento.it.",
      );
    }
  };

  const isAccrediti = activeModal === "accrediti";

  const modalTitle = isAccrediti
    ? "Richiesta Accredito Gara Federale"
    : "Giustificazione Assenza Riunione Tecnica Obbligatoria";
  const modalSubtitle = isAccrediti
    ? "Modulo riservato agli associati AIA Agrigento in regola con il tesseramento stagionale."
    : "I dati saranno trasmessi direttamente alla Segreteria Sezionale.";

  return (
    <div
      ref={dialogRef}
      id="servizi-forms-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="servizi-modal-title"
      aria-describedby="servizi-modal-subtitle"
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
              id="servizi-modal-title"
              className="font-heading mt-0.5 text-lg leading-snug font-bold tracking-tight text-white sm:text-xl"
            >
              {modalTitle}
            </h2>
            <p
              id="servizi-modal-subtitle"
              className="mt-1 font-sans text-xs text-blue-100"
            >
              {modalSubtitle}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeModal}
            aria-label={
              isAccrediti
                ? "Chiudi modulo richiesta accredito"
                : "Chiudi modulo giustificazione assenza"
            }
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
                {isAccrediti
                  ? "Richiesta di accredito inviata con successo"
                  : "Giustificazione registrata con successo"}
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
                    {isAccrediti
                      ? `${accreditoData.cognome} ${accreditoData.nome} (Mecc. ${accreditoData.meccanografico})`
                      : `${giustificaData.cognome} ${giustificaData.nome} (Mecc. ${giustificaData.meccanografico})`}
                  </dd>
                </div>
                <div>
                  <dt className="font-heading font-semibold text-slate-500 uppercase">
                    {isAccrediti ? "Gara Richiesta" : "Riunione Giustificata"}
                  </dt>
                  <dd className="mt-0.5 font-sans font-bold text-slate-900">
                    {isAccrediti ? accreditoData.partita : giustificaData.evento}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitStatus("idle");
                    setServerMessage("");
                    if (isAccrediti) {
                      setAccreditoData((prev) => ({
                        ...prev,
                        partita: "",
                        note: "",
                        privacy: false,
                      }));
                    } else {
                      setGiustificaData((prev) => ({
                        ...prev,
                        evento: fallbackDefaultEvent,
                        motivo: "",
                        privacy: false,
                      }));
                    }
                  }}
                  className="font-heading min-h-[48px] w-full cursor-pointer rounded-sm border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-slate-800 uppercase transition-colors hover:bg-slate-50 sm:w-auto"
                >
                  {isAccrediti
                    ? "Invia un'altra richiesta"
                    : "Invia un'altra giustificazione"}
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
          ) : isAccrediti ? (
            <form
              onSubmit={handleAccreditoSubmit}
              noValidate
              className="space-y-4"
            >
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
                    htmlFor="accredito-cognome"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Cognome *
                  </label>
                  <input
                    id="accredito-cognome"
                    name="cognome"
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder="Es. Rossi"
                    value={accreditoData.cognome}
                    onChange={(e) =>
                      updateAccreditoField("cognome", e.target.value)
                    }
                    aria-invalid={Boolean(accreditoErrors.cognome)}
                    aria-describedby={
                      accreditoErrors.cognome
                        ? "accredito-cognome-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      accreditoErrors.cognome
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {accreditoErrors.cognome && (
                    <p
                      id="accredito-cognome-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {accreditoErrors.cognome}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="accredito-nome"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Nome *
                  </label>
                  <input
                    id="accredito-nome"
                    name="nome"
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder="Es. Mario"
                    value={accreditoData.nome}
                    onChange={(e) =>
                      updateAccreditoField("nome", e.target.value)
                    }
                    aria-invalid={Boolean(accreditoErrors.nome)}
                    aria-describedby={
                      accreditoErrors.nome ? "accredito-nome-error" : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      accreditoErrors.nome
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {accreditoErrors.nome && (
                    <p
                      id="accredito-nome-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {accreditoErrors.nome}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="accredito-email"
                  className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                >
                  Indirizzo Email (registrato su Sinfonia4You) *
                </label>
                <input
                  id="accredito-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="mario.rossi@email.it"
                  value={accreditoData.email}
                  onChange={(e) =>
                    updateAccreditoField("email", e.target.value)
                  }
                  aria-invalid={Boolean(accreditoErrors.email)}
                  aria-describedby={
                    accreditoErrors.email ? "accredito-email-error" : undefined
                  }
                  className={cn(
                    "mt-1.5 block min-h-[44px] w-full max-w-full truncate rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    accreditoErrors.email
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {accreditoErrors.email && (
                  <p
                    id="accredito-email-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {accreditoErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="accredito-meccanografico"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Codice Meccanografico AIA *
                  </label>
                  <input
                    id="accredito-meccanografico"
                    name="meccanografico"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="7 cifre (es. 1234567)"
                    value={accreditoData.meccanografico}
                    onChange={(e) =>
                      updateAccreditoField(
                        "meccanografico",
                        e.target.value.replace(/\D/g, "").slice(0, 8),
                      )
                    }
                    aria-invalid={Boolean(accreditoErrors.meccanografico)}
                    aria-describedby={
                      accreditoErrors.meccanografico
                        ? "accredito-meccanografico-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      accreditoErrors.meccanografico
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {accreditoErrors.meccanografico && (
                    <p
                      id="accredito-meccanografico-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {accreditoErrors.meccanografico}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="accredito-tessera"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Numero Tessera Federale *
                  </label>
                  <input
                    id="accredito-tessera"
                    name="numeroTessera"
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Solo cifre"
                    value={accreditoData.numeroTessera}
                    onChange={(e) =>
                      updateAccreditoField(
                        "numeroTessera",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    aria-invalid={Boolean(accreditoErrors.numeroTessera)}
                    aria-describedby={
                      accreditoErrors.numeroTessera
                        ? "accredito-tessera-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      accreditoErrors.numeroTessera
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {accreditoErrors.numeroTessera && (
                    <p
                      id="accredito-tessera-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {accreditoErrors.numeroTessera}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="accredito-luogo-nascita"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Luogo di Nascita *
                  </label>
                  <input
                    id="accredito-luogo-nascita"
                    name="luogoNascita"
                    type="text"
                    required
                    placeholder="Es. Agrigento"
                    value={accreditoData.luogoNascita}
                    onChange={(e) =>
                      updateAccreditoField("luogoNascita", e.target.value)
                    }
                    aria-invalid={Boolean(accreditoErrors.luogoNascita)}
                    aria-describedby={
                      accreditoErrors.luogoNascita
                        ? "accredito-luogo-nascita-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      accreditoErrors.luogoNascita
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {accreditoErrors.luogoNascita && (
                    <p
                      id="accredito-luogo-nascita-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {accreditoErrors.luogoNascita}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="accredito-data-nascita"
                    className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                  >
                    Data di Nascita *
                  </label>
                  <input
                    id="accredito-data-nascita"
                    name="dataNascita"
                    type="date"
                    required
                    value={accreditoData.dataNascita}
                    onChange={(e) =>
                      updateAccreditoField("dataNascita", e.target.value)
                    }
                    aria-invalid={Boolean(accreditoErrors.dataNascita)}
                    aria-describedby={
                      accreditoErrors.dataNascita
                        ? "accredito-data-nascita-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      accreditoErrors.dataNascita
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {accreditoErrors.dataNascita && (
                    <p
                      id="accredito-data-nascita-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {accreditoErrors.dataNascita}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="accredito-partita"
                  className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                >
                  Gara Richiesta (Squadre, Data e Campionato) *
                </label>
                <input
                  id="accredito-partita"
                  name="partita"
                  type="text"
                  required
                  placeholder="Es. Akragas - Siracusa del 15/03/2026 - Serie D Girone I"
                  value={accreditoData.partita}
                  onChange={(e) =>
                    updateAccreditoField("partita", e.target.value)
                  }
                  aria-invalid={Boolean(accreditoErrors.partita)}
                  aria-describedby={
                    accreditoErrors.partita
                      ? "accredito-partita-error"
                      : undefined
                  }
                  className={cn(
                    "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    accreditoErrors.partita
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {accreditoErrors.partita && (
                  <p
                    id="accredito-partita-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {accreditoErrors.partita}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="accredito-note"
                  className="font-heading block text-xs font-semibold tracking-wider text-slate-800 uppercase"
                >
                  Note
                </label>
                <textarea
                  id="accredito-note"
                  name="note"
                  rows={3}
                  value={accreditoData.note}
                  onChange={(e) => updateAccreditoField("note", e.target.value)}
                  aria-invalid={Boolean(accreditoErrors.note)}
                  aria-describedby={
                    accreditoErrors.note ? "accredito-note-error" : undefined
                  }
                  className={cn(
                    "mt-1.5 block w-full rounded-sm border bg-white px-3.5 py-2.5 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    accreditoErrors.note
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {accreditoErrors.note && (
                  <p
                    id="accredito-note-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {accreditoErrors.note}
                  </p>
                )}
              </div>

              <div className="rounded-sm border border-slate-200 bg-slate-50 p-3.5">
                <label
                  htmlFor="accredito-privacy"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="accredito-privacy"
                    name="privacy"
                    type="checkbox"
                    checked={accreditoData.privacy}
                    onChange={(e) =>
                      updateAccreditoField("privacy", e.target.checked)
                    }
                    aria-invalid={Boolean(accreditoErrors.privacy)}
                    aria-describedby={
                      accreditoErrors.privacy
                        ? "accredito-privacy-error"
                        : undefined
                    }
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-xs border-slate-300 text-[#004b97] focus:ring-[#004b97]"
                  />
                  <span className="font-sans text-xs leading-relaxed text-slate-700">
                    Dichiaro di essere in possesso di regolare tessera federale
                    AIA in corso di validità e acconsento al trattamento dei
                    dati personali per l&apos;inoltro della richiesta di
                    accredito alla società ospitante. *
                  </span>
                </label>
                {accreditoErrors.privacy && (
                  <p
                    id="accredito-privacy-error"
                    className="mt-1.5 font-sans text-xs text-red-700"
                  >
                    {accreditoErrors.privacy}
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
                    : "Invia Richiesta Accredito"}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleGiustificaSubmit}
              noValidate
              className="space-y-4"
            >
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
                    value={giustificaData.cognome}
                    onChange={(e) =>
                      updateGiustificaField("cognome", e.target.value)
                    }
                    aria-invalid={Boolean(giustificaErrors.cognome)}
                    aria-describedby={
                      giustificaErrors.cognome
                        ? "giustifica-cognome-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      giustificaErrors.cognome
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {giustificaErrors.cognome && (
                    <p
                      id="giustifica-cognome-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {giustificaErrors.cognome}
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
                    value={giustificaData.nome}
                    onChange={(e) =>
                      updateGiustificaField("nome", e.target.value)
                    }
                    aria-invalid={Boolean(giustificaErrors.nome)}
                    aria-describedby={
                      giustificaErrors.nome
                        ? "giustifica-nome-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      giustificaErrors.nome
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {giustificaErrors.nome && (
                    <p
                      id="giustifica-nome-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {giustificaErrors.nome}
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
                  value={giustificaData.email}
                  onChange={(e) =>
                    updateGiustificaField("email", e.target.value)
                  }
                  aria-invalid={Boolean(giustificaErrors.email)}
                  aria-describedby={
                    giustificaErrors.email
                      ? "giustifica-email-error"
                      : undefined
                  }
                  className={cn(
                    "mt-1.5 block min-h-[44px] w-full max-w-full truncate rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    giustificaErrors.email
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {giustificaErrors.email && (
                  <p
                    id="giustifica-email-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {giustificaErrors.email}
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
                    value={giustificaData.meccanografico}
                    onChange={(e) =>
                      updateGiustificaField(
                        "meccanografico",
                        e.target.value.replace(/\D/g, "").slice(0, 8),
                      )
                    }
                    aria-invalid={Boolean(giustificaErrors.meccanografico)}
                    aria-describedby={
                      giustificaErrors.meccanografico
                        ? "giustifica-meccanografico-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      giustificaErrors.meccanografico
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {giustificaErrors.meccanografico && (
                    <p
                      id="giustifica-meccanografico-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {giustificaErrors.meccanografico}
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
                    value={giustificaData.numeroTessera}
                    onChange={(e) =>
                      updateGiustificaField(
                        "numeroTessera",
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    aria-invalid={Boolean(giustificaErrors.numeroTessera)}
                    aria-describedby={
                      giustificaErrors.numeroTessera
                        ? "giustifica-tessera-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      giustificaErrors.numeroTessera
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {giustificaErrors.numeroTessera && (
                    <p
                      id="giustifica-tessera-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {giustificaErrors.numeroTessera}
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
                    value={giustificaData.luogoNascita}
                    onChange={(e) =>
                      updateGiustificaField("luogoNascita", e.target.value)
                    }
                    aria-invalid={Boolean(giustificaErrors.luogoNascita)}
                    aria-describedby={
                      giustificaErrors.luogoNascita
                        ? "giustifica-luogo-nascita-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                      giustificaErrors.luogoNascita
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {giustificaErrors.luogoNascita && (
                    <p
                      id="giustifica-luogo-nascita-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {giustificaErrors.luogoNascita}
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
                    value={giustificaData.dataNascita}
                    onChange={(e) =>
                      updateGiustificaField("dataNascita", e.target.value)
                    }
                    aria-invalid={Boolean(giustificaErrors.dataNascita)}
                    aria-describedby={
                      giustificaErrors.dataNascita
                        ? "giustifica-data-nascita-error"
                        : undefined
                    }
                    className={cn(
                      "mt-1.5 block min-h-[44px] w-full rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 tabular-nums transition-colors focus:border-[#004b97] focus:outline-none",
                      giustificaErrors.dataNascita
                        ? "border-red-500 bg-red-50/30"
                        : "border-slate-300",
                    )}
                  />
                  {giustificaErrors.dataNascita && (
                    <p
                      id="giustifica-data-nascita-error"
                      className="mt-1 font-sans text-xs text-red-700"
                    >
                      {giustificaErrors.dataNascita}
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
                  value={giustificaData.evento}
                  onChange={(e) =>
                    updateGiustificaField("evento", e.target.value)
                  }
                  aria-invalid={Boolean(giustificaErrors.evento)}
                  aria-describedby={
                    giustificaErrors.evento
                      ? "giustifica-evento-error"
                      : undefined
                  }
                  className={cn(
                    "mt-1.5 block min-h-[44px] w-full max-w-full truncate rounded-sm border bg-white px-3.5 py-2 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    giustificaErrors.evento
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                >
                  {eventOptions.map((optionLabel) => (
                    <option key={optionLabel} value={optionLabel}>
                      {optionLabel}
                    </option>
                  ))}
                </select>
                {giustificaErrors.evento && (
                  <p
                    id="giustifica-evento-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {giustificaErrors.evento}
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
                  placeholder="Indica la motivazione (Studio, Impegni lavorativi documentati, Motivi di salute)..."
                  value={giustificaData.motivo}
                  onChange={(e) =>
                    updateGiustificaField("motivo", e.target.value)
                  }
                  aria-invalid={Boolean(giustificaErrors.motivo)}
                  aria-describedby={
                    giustificaErrors.motivo
                      ? "giustifica-motivo-error"
                      : undefined
                  }
                  className={cn(
                    "mt-1.5 block w-full rounded-sm border bg-white px-3.5 py-2.5 font-sans text-sm text-slate-900 transition-colors focus:border-[#004b97] focus:outline-none",
                    giustificaErrors.motivo
                      ? "border-red-500 bg-red-50/30"
                      : "border-slate-300",
                  )}
                />
                {giustificaErrors.motivo && (
                  <p
                    id="giustifica-motivo-error"
                    className="mt-1 font-sans text-xs text-red-700"
                  >
                    {giustificaErrors.motivo}
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
                    checked={giustificaData.privacy}
                    onChange={(e) =>
                      updateGiustificaField("privacy", e.target.checked)
                    }
                    aria-invalid={Boolean(giustificaErrors.privacy)}
                    aria-describedby={
                      giustificaErrors.privacy
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
                {giustificaErrors.privacy && (
                  <p
                    id="giustifica-privacy-error"
                    className="mt-1.5 font-sans text-xs text-red-700"
                  >
                    {giustificaErrors.privacy}
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
