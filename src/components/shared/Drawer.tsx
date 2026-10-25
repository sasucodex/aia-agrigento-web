import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import {
  MAIN_NAV_ITEMS,
  PRIMARY_CTA,
  isNavItemActive,
} from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

export interface DrawerProps {
  currentPath: string;
}

export default function Drawer({ currentPath }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={
          isOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"
        }
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
        className="focus-visible:outline-referee-gold inline-flex h-12 w-12 items-center justify-center rounded-sm text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div
        ref={dialogRef}
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu di navigazione principale"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "transition-visibility fixed inset-0 z-50 duration-200 md:hidden",
          isOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible",
        )}
      >
        <div
          onClick={closeDrawer}
          aria-hidden="true"
          className={cn(
            "fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          className={cn(
            "fixed inset-y-0 right-0 flex w-full max-w-xs flex-col bg-white shadow-xl transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-20 items-center justify-between border-b border-blue-900/40 bg-[#004b97] px-4">
            <a
              href="/"
              onClick={closeDrawer}
              className="focus-visible:outline-referee-gold inline-flex items-center gap-3 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <img
                src="/favicon.svg"
                alt="Stemma AIA Agrigento"
                width="44"
                height="44"
                loading="lazy"
                decoding="async"
                className="h-11 w-11 shrink-0 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-heading text-referee-gold text-[10px] font-semibold tracking-widest uppercase">
                  F.I.G.C. — A.I.A.
                </span>
                <span className="font-heading text-sm font-bold tracking-tight text-white">
                  Sezione di Agrigento
                </span>
              </div>
            </a>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerButtonRef.current?.focus();
              }}
              aria-label="Chiudi menu di navigazione"
              className="focus-visible:outline-referee-gold inline-flex h-12 w-12 items-center justify-center rounded-sm text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
            <nav aria-label="Navigazione mobile">
              <ul className="divide-y divide-slate-100 border-y border-slate-100">
                {MAIN_NAV_ITEMS.map((item) => {
                  const active = isNavItemActive(currentPath, item);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        onClick={closeDrawer}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "font-heading flex min-h-[48px] items-center justify-between px-3 py-3 text-base tracking-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]",
                          active
                            ? "border-referee-gold border-l-4 bg-slate-50 font-bold text-[#004b97]"
                            : "font-medium text-slate-800 hover:bg-slate-50 hover:text-[#004b97]",
                        )}
                      >
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <a
                href={PRIMARY_CTA.href}
                onClick={closeDrawer}
                className="bg-referee-gold font-heading inline-flex min-h-[48px] w-full items-center justify-center rounded-sm px-5 py-3.5 text-sm font-bold tracking-wider text-slate-950 uppercase shadow-xs transition-all duration-200 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97] active:scale-[0.98]"
              >
                {PRIMARY_CTA.label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
