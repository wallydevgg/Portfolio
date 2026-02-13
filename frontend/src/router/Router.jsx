import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "@/barrell";
import Layout from "@/components/ui/Layout/Layout";
import ErrorPage from "@/pages/error/errorPage";
import NotFoundPage from "@/pages/error/errorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
  },
});

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
