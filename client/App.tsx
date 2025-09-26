import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
const Index = React.lazy(() => import("./pages/Index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const CustomerPortal = React.lazy(() => import("./pages/CustomerPortal"));
const OrganizerPortal = React.lazy(() => import("./pages/OrganizerPortal"));
const CMS = React.lazy(() => import("./pages/CMS"));
import Admin from "./pages/Admin";
const Signup = React.lazy(() => import("./pages/Signup"));
const Profile = React.lazy(() => import("./pages/Profile"));
import Chatbot from "@/components/Chatbot";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

function getActiveRole(): "customer" | "organizer" | null {
  const c = localStorage.getItem("ce_active_customer");
  const o = localStorage.getItem("ce_active_organizer");
  if (c) return "customer";
  if (o) return "organizer";
  return null;
}

function RedirectHome() {
  const r = getActiveRole();
  if (r === "customer") return <Navigate to="/customer" replace />;
  if (r === "organizer") return <Navigate to="/organizer" replace />;
  return <Index />;
}

function RedirectSignup() {
  const r = getActiveRole();
  if (r === "customer") return <Navigate to="/customer" replace />;
  if (r === "organizer") return <Navigate to="/organizer" replace />;
  return <Signup />;
}

function Guard({ role, children }: { role: "customer" | "organizer"; children: React.ReactNode }) {
  const r = getActiveRole();
  if (r !== role) return <Navigate to="/signup" replace />;
  return <>{children}</>;
}

function GuardAny({ children }: { children: React.ReactNode }) {
  const r = getActiveRole();
  if (!r) return <Navigate to="/signup" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading…</div>}>
            <Routes>
              <Route path="/" element={<RedirectHome />} />
              <Route path="/customer" element={<CustomerPortal />} />
              <Route path="/organizer" element={<OrganizerPortal />} />
              <Route path="/profile" element={<GuardAny><Profile /></GuardAny>} />
              <Route path="/signup" element={<RedirectSignup />} />
              <Route path="/cms/*" element={<CMS />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Chatbot />
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
