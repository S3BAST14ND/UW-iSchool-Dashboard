import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onLocalAuthStateChanged } from "./utils/localStore";

import Landing from "./components/Landing";
import AppLayout from "./components/AppLayout";
import Quiz from "./components/Quiz";
import Advising from "./components/advising";
import Resources from "./components/Resources";
import Alumni from "./components/alumni";
import Dashboard from "./components/Dashboard";
import DegreeAuditDebug from "./components/AuditParse";
import Profile from "./components/Profile";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onLocalAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  if (authLoading) return null;

  const protect = (component) =>
    isAuthenticated ? component : <Navigate to="/" replace />;

  return (
    <Routes>
      <Route
        path="/"
        element={<Landing onLogin={() => setIsAuthenticated(true)} />}
      />
      <Route path="/dashboard" element={protect(<AppLayout><Dashboard /></AppLayout>)} />
      <Route path="/quiz"      element={protect(<AppLayout><Quiz /></AppLayout>)} />
      <Route path="/advising"  element={protect(<AppLayout><Advising /></AppLayout>)} />
      <Route path="/resources" element={protect(<AppLayout><Resources /></AppLayout>)} />
      <Route path="/alumni"    element={protect(<AppLayout><Alumni /></AppLayout>)} />
      <Route path="/parse"     element={protect(<AppLayout><DegreeAuditDebug /></AppLayout>)} />
      <Route path="/profile"   element={protect(<AppLayout><Profile /></AppLayout>)} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
