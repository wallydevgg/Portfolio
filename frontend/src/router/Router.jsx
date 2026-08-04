import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Home } from "@/barrell";
import Layout from "@/components/ui/Layout/Layout";
import ErrorPage from "@/pages/error/errorPage";
import NotFoundPage from "@/pages/error/NotFoundPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostsPage from "@/pages/Dashboard/Posts/index";
import PostEditorPage from "@/pages/Dashboard/Posts/Editor";
import ExperiencePage from "@/pages/Dashboard/Experience/index";
import SkillsPage from "@/pages/Dashboard/Skills/index";
import ProjectsPage from "@/pages/Dashboard/Projects/index";
import AboutDashboardPage from "@/pages/Dashboard/About/index";
import SettingsPage from "@/pages/Dashboard/Settings/index";
import SeoSettingsPage from "@/pages/Dashboard/Settings/SEO";
import MessagesPage from "@/pages/Dashboard/Messages/index";
import MessageDetailPage from "@/pages/Dashboard/Messages/Detail";
import NotificationsSettings from "@/pages/Dashboard/Settings/Notifications";
import OverviewPage from "@/pages/Dashboard/Overview/index";
import BlogPage from "@/pages/Blog/BlogPage";
import PrivacyPage from "@/pages/Privacy/Privacy";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/Login/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const router = createBrowserRouter(
  [
    {
      element: (
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      ),
      children: [
        {
          path: "/",
          element: <Layout />,
          errorElement: <ErrorPage />,
          children: [
            { path: "/", element: <Home /> },
            { path: "/blog", element: <BlogPage /> },
            { path: "/privacy", element: <PrivacyPage /> },
            { path: "*", element: <NotFoundPage /> },
          ],
        },
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          path: "/dashboard",
          element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          ),
          children: [
            { path: "", element: <OverviewPage /> },
            { path: "posts", element: <PostsPage /> },
            { path: "posts/new", element: <PostEditorPage /> },
            { path: "posts/:id/edit", element: <PostEditorPage /> },
            { path: "experience", element: <ExperiencePage /> },
            { path: "about", element: <AboutDashboardPage /> },
            { path: "skills", element: <SkillsPage /> },
            { path: "projects", element: <ProjectsPage /> },
            { path: "messages", element: <MessagesPage /> },
            { path: "messages/:id", element: <MessageDetailPage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "settings/seo", element: <SeoSettingsPage /> },
            { path: "settings/notifications", element: <NotificationsSettings /> },
          ],
        },
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
