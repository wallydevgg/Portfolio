import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import MetaTags from "../meta/MetaTags";

import "./error.scss";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    document.documentElement.setAttribute("data-theme", systemTheme);
  }, []);

  return (
    <div id="error-page">
      <MetaTags
        title="Oops - Not authorized"
        description="An unexpected error has occurred. Please try again later."
        url="https://wallydev.dev/error"
        image="https://i.postimg.cc/pdBh5HKM/proy2.png"
        robots="noindex, nofollow"
      />
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}
