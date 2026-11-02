import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getCourseFAQs } from "@/lib/utils/faq";
import { cn } from "@/lib/utils/cn";
import type { CourseFAQItem } from "@/types/faq";

export interface FAQAccordionProps {
  items?: CourseFAQItem[];
  kicker?: string;
  title?: string;
  subtitle?: string;
}

export default function FAQAccordion({
  items = getCourseFAQs(),
  kicker,
  title = "DOMANDE FREQUENTI",
  subtitle = "Tutte le risposte ufficiali sui costi, sul doppio tesseramento, sui rimborsi gara e sull'ingresso gratuito negli stadi italiani.",
}: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="domande-frequenti"
      aria-labelledby="course-faq-heading"
      className="scroll-mt-20 border-b border-slate-100 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          {kicker && (
            <span className="font-heading mb-3 block text-center text-xs font-semibold tracking-widest text-[#9c8242] uppercase">
              {kicker}
            </span>
          )}

          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-4">
            <div
              className="h-[2px] min-w-5 flex-1 shrink-0 bg-[#004b97] sm:min-w-8"
              aria-hidden="true"
            />
            <h2
              id="course-faq-heading"
              className="font-heading text-center text-xl font-extrabold tracking-tight text-balance text-slate-900 uppercase sm:text-2xl lg:text-3xl"
            >
              {title}
            </h2>
            <div
              className="h-[2px] min-w-5 flex-1 shrink-0 bg-[#004b97] sm:min-w-8"
              aria-hidden="true"
            />
          </div>

          <p className="mx-auto max-w-2xl text-center font-sans text-base leading-relaxed text-pretty text-slate-700">
            {subtitle}
          </p>
        </div>

        <div className="mx-auto max-w-4xl divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item) => {
            const isOpen = openId === item.id;
            const triggerId = `faq-trigger-${item.id}`;
            const panelId = `faq-panel-${item.id}`;

            return (
              <div key={item.id} className="py-1">
                <h3>
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item.id)}
                    className="group flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#004b97]"
                  >
                    <span className="font-heading text-base leading-snug font-bold tracking-tight text-slate-900 transition-colors group-hover:text-[#004b97] sm:text-lg">
                      {item.question}
                    </span>

                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border transition-all duration-200",
                        isOpen
                          ? "border-[#004b97] bg-[#004b97] text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 group-hover:border-[#004b97] group-hover:text-[#004b97]",
                      )}
                      aria-hidden="true"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  hidden={!isOpen}
                  className={cn("pb-5", isOpen ? "block" : "hidden")}
                >
                  <p className="max-w-prose font-sans text-sm leading-relaxed text-pretty text-slate-700 sm:text-base">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
