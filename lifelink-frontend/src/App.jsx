import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CheckRelief from "./pages/CheckRelief";
import Layout from "./components/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/check" replace />} />
              <Route path="/check" element={<CheckRelief />} />
              <Route path="*" element={<Navigate to="/check" replace />} />
            </Routes>
          </Layout>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}
