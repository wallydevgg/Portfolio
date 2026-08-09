import { createBrowserRouter, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Home } from "@/barrell";
import Layout from "@/components/ui/Layout/Layout";
import ErrorPage from "@/pages/error/errorPage";
import NotFoundPage from "@/pages/error/NotFoundPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import PostsPage from "@/pages/Dashboard/Posts/index";
import PostEditorPage from "@/pages/Dashboard/Posts/Editor";
import PostPreviewPage from "@/pages/Dashboard/Posts/Preview";
import ArchivedPostsPage from "@/pages/Dashboard/Posts/Archived";
import ExperiencePage from "@/pages/Dashboard/Experience/index";
import SkillsPage from "@/pages/Dashboard/Skills/index";
import ProjectsPage from "@/pages/Dashboard/Projects/index";
import AboutDashboardPage from "@/pages/Dashboard/About/index";
import SettingsPage from "@/pages/Dashboard/Settings/index";
import SeoSettingsPage from "@/pages/Dashboard/Settings/SEO";
import MessagesPage from "@/pages/Dashboard/Messages/index";
import MessageDetailPage from "@/pages/Dashboard/Messages/Detail";
import NotificationsSettings from "@/pages/Dashboard/Settings/Notifications";
import CVSettingsPage from "@/pages/Dashboard/Settings/CV";
import OverviewPage from "@/pages/Dashboard/Overview/index";
import BlogPage from "@/pages/Blog/BlogPage";
import BlogPostPage from "@/pages/Blog/BlogPostPage";
import PrivacyPage from "@/pages/Privacy/Privacy";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import LoginPage from "@/pages/Login/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Se exporta para que los tests puedan montar el árbol real con un router en
// memoria. Comprobar las rutas contra una composición de providers inventada en
// el test no serviría: lo que se quiere verificar es justo esta.
export const routes = [
    {
      // ToastProvider va aquí, en la raíz, y no dentro de DashboardLayout: la
      // vista previa vive fuera del layout y también necesita toasts. Con el
      // provider en dos sitios, qué ruta tenía toasts dependía de por dónde
      // colgara la página.
      element: (
        <AuthProvider>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
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
            { path: "/blog/:slug", element: <BlogPostPage /> },
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
            { path: "posts/archived", element: <ArchivedPostsPage /> },
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
            { path: "settings/cv", element: <CVSettingsPage /> },
          ],
        },
        {
          // Fuera de DashboardLayout a propósito: con el chrome del dashboard
          // alrededor, la vista previa no mostraría la página real.
          path: "/dashboard/posts/:id/preview",
          element: (
            <ProtectedRoute>
              <PostPreviewPage />
            </ProtectedRoute>
          ),
        },
      ],
    },
];

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
  },
});

const Router = () => <RouterProvider router={router} />;

export default Router;
