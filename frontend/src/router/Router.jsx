import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "@/barrell";
import Layout from "@/components/ui/Layout/Layout";
import ErrorPage from "@/pages/error/errorPage";
import NotFoundPage from "@/pages/error/errorPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostsPage from "@/pages/Dashboard/Posts/index";
import CreatePostPage from "@/pages/Dashboard/Posts/Editor";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/Login/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
  {
    path: "/login",
    element: (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      </AuthProvider>
    ),
    children: [
      {
        path: "posts",
        element: <PostsPage />,
      },
      {
        path: "posts/new",
        element: <CreatePostPage />,
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
  },
});

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
