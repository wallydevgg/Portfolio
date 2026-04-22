import { useEffect } from "react";
import MetaTags from "../meta/MetaTags";
import "./error.scss";

export default function NotFoundPage() {
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
        title="404 - Page Not Found"
        description="The page you are looking for might have been removed or is temporarily unavailable."
        url="https://wallydev.dev/404"
        image="https://i.postimg.cc/pdBh5HKM/proy2.png"
        robots="noindex, nofollow"
      />
      <h1>404</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>
        <i>The page might have been removed, had its name changed, or is temporarily unavailable.</i>
      </p>
    </div>
  );
}
