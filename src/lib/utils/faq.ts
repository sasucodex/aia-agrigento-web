import faqRaw from "@/data/faq.json";
import type { CourseFAQItem, FAQCategory } from "@/types/faq";

const faqData = faqRaw as CourseFAQItem[];

export function getAllFAQs(): CourseFAQItem[] {
  return [...faqData].sort((a, b) => a.order - b.order);
}

export function getFAQsByCategory(category: FAQCategory): CourseFAQItem[] {
  return getAllFAQs().filter((item) => item.category === category);
}

export function getCourseFAQs(): CourseFAQItem[] {
  return getFAQsByCategory("corso");
}
