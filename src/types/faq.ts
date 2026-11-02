export type FAQCategory = "corso" | "generale";

export interface CourseFAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
  order: number;
}

export type FAQItem = CourseFAQItem;
