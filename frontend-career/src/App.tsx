import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import LocationsPage from "./pages/LocationsPage";
import PeoplePage from "./pages/PeoplePage";
import ConnectPage from "./pages/ConnectPage";

// Wrapper component for pages that need the Layout
const WithLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Connect page without Layout (full-page experience) */}
        <Route path="/connect" element={<ConnectPage />} />

        {/* All other pages with Layout */}
        <Route
          path="/"
          element={
            <WithLayout>
              <HomePage />
            </WithLayout>
          }
        />
        <Route
          path="/jobs"
          element={
            <WithLayout>
              <JobsPage />
            </WithLayout>
          }
        />
        <Route
          path="/jobs/:id"
          element={
            <WithLayout>
              <JobDetailsPage />
            </WithLayout>
          }
        />
        <Route
          path="/locations"
          element={
            <WithLayout>
              <LocationsPage />
            </WithLayout>
          }
        />
        <Route
          path="/people"
          element={
            <WithLayout>
              <PeoplePage />
            </WithLayout>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <WithLayout>
              <HomePage />
            </WithLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
