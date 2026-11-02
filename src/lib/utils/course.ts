import courseRaw from "@/data/course.json";
import { getCourseFAQs } from "@/lib/utils/faq";
import {
  CourseRegistrationSchema,
  type CourseBenefitsData,
  type CourseDataset,
  type CourseHeroData,
  type CourseRegistrationPayload,
  type CourseRegistrationSectionData,
  type CourseStepsAndRequirementsData,
} from "@/types/course";

const courseData = courseRaw as CourseDataset;

export { CourseRegistrationSchema, getCourseFAQs };
export type { CourseRegistrationPayload };

export function getCourseData(): CourseDataset {
  return courseData;
}

export function getCourseHero(): CourseHeroData {
  return courseData.hero;
}

export function getCourseBenefits(): CourseBenefitsData {
  return courseData.benefits;
}

export function getCourseStepsAndRequirements(): CourseStepsAndRequirementsData {
  return courseData.journey;
}

export function getCourseRegistrationSection(): CourseRegistrationSectionData {
  return courseData.registration;
}

export function buildCourseWhatsAppUrl(customMessage?: string): string {
  const number = courseData.whatsappNumber.replace(/\D/g, "");
  const message = customMessage ?? courseData.whatsappText;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
