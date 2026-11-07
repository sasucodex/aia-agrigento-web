import launchData from "@/data/launch.json";
import type {
  LaunchCoursePageData,
  LaunchData,
  LaunchServiceItem,
} from "@/types/launch";

export function getLaunchData(): LaunchData {
  return launchData as LaunchData;
}

export function getLaunchCountdownDate(): Date {
  return new Date(getLaunchData().meetingDate);
}

export function getLaunchServices(): LaunchServiceItem[] {
  return getLaunchData().services.items;
}

export function getLaunchCoursePageData(): LaunchCoursePageData {
  return getLaunchData().coursePage;
}
