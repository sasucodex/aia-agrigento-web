import type { APIRoute } from "astro";

export const prerender = false;

const PREVIEW_COOKIE_NAME = "anteprima_segreta";
const PREVIEW_COOKIE_VALUE = "attiva";
const PREVIEW_SECRET_KEY = "presentazione";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const key = url.searchParams.get("key");
  const disable = url.searchParams.get("off");

  if (disable === "1" || disable === "true") {
    cookies.delete(PREVIEW_COOKIE_NAME, { path: "/" });
    return redirect("/lancio", 307);
  }

  if (key === PREVIEW_SECRET_KEY) {
    cookies.set(PREVIEW_COOKIE_NAME, PREVIEW_COOKIE_VALUE, {
      path: "/",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
    });
    return redirect("/", 307);
  }

  return redirect("/lancio", 307);
};
