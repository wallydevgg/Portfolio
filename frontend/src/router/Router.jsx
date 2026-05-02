// ✅ GENERADO POR CLAUDE - Archivo: frontend/src/router/Router.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "@/barrell";
import Layout from "@/components/ui/Layout/Layout";
import ErrorPage from "@/pages/error/errorPage";
import NotFoundPage from "@/pages/error/errorPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostsPage from "@/pages/Dashboard/Posts/index";
import PostEditorPage from "@/pages/Dashboard/Posts/Editor";
import ExperiencePage from "@/pages/Dashboard/Experience/index";
import SkillsPage from "@/pages/Dashboard/Skills/index";
import ProjectsPage from "@/pages/Dashboard/Projects/index";
import SettingsPage from "@/pages/Dashboard/Settings/index";
import BlogPage from "@/pages/Blog/BlogPage";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/Login/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/blog", element: <BlogPage /> },
        { path: "*", element: <NotFoundPage /> },
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
        { path: "", element: <PostsPage /> },
        { path: "posts", element: <PostsPage /> },
        { path: "posts/new", element: <PostEditorPage /> },
        { path: "posts/:id/edit", element: <PostEditorPage /> },
        { path: "experience", element: <ExperiencePage /> },
        { path: "skills", element: <SkillsPage /> },
        { path: "projects", element: <ProjectsPage /> },
        { path: "settings", element: <SettingsPage /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

const Router = () => <RouterProvider router={router} />;

export default Router;
