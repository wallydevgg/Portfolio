import MetaTags from "../meta/MetaTags";

import "./error.scss";

export default function NotFoundPage() {
  return (
    <div id="error-page">
      <MetaTags
        title="404 - Page not found"
        description="The page you are looking for does not exist."
        url="https://wallydev.dev/404"
        image="https://i.postimg.cc/pdBh5HKM/proy2.png"
        robots="noindex, nofollow"
      />
      <h1>404</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>
        <a href="/">Go back to the homepage</a>
      </p>
    </div>
  );
}
