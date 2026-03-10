import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Sidebar from "./components/Sidebar";
import { UserProvider } from "./context/UserContext";
import ContactsPage from "./pages/ContactsPage";
import Dashboard from "./pages/Dashboard";
import OpportunityDetail from "./pages/OpportunityDetail";

// Root layout
function RootLayout() {
  return (
    <UserProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-screen">
          <Outlet />
        </main>
      </div>
      <Toaster richColors />
    </UserProvider>
  );
}

// Routes
const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contacts",
  component: ContactsPage,
});

const opportunityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/opportunity/$id",
  component: OpportunityDetail,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  contactsRoute,
  opportunityRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
