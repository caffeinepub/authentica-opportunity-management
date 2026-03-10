import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { LogIn, TrendingUp } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { UserProvider } from "./context/UserContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import ContactsPage from "./pages/ContactsPage";
import Dashboard from "./pages/Dashboard";
import OpportunityDetail from "./pages/OpportunityDetail";

function LoginGate({ children }: { children: React.ReactNode }) {
  const { loginStatus, identity, login, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = loginStatus === "success" && !!identity;

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        data-ocid="auth.loading_state"
      >
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-background"
        data-ocid="auth.login.panel"
      >
        <div className="flex flex-col items-center gap-8 max-w-sm w-full px-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold font-display text-foreground">
                Authentica
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Opportunity Management
              </p>
            </div>
          </div>
          <div className="w-full border border-border rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Sign in with Internet Identity to access your pipeline.
            </p>
            <button
              type="button"
              onClick={login}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold rounded-lg px-4 py-3 hover:bg-primary/90 transition-colors"
              data-ocid="auth.login.button"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Internet Identity
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Root layout
function RootLayout() {
  return (
    <LoginGate>
      <UserProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-h-screen">
            <Outlet />
          </main>
        </div>
        <Toaster richColors />
      </UserProvider>
    </LoginGate>
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
