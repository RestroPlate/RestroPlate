import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import DonorDashboard from "./pages/DonorDashboard";
import DonorCreateDonation from "./pages/DonorCreateDonation";
import DonorMyDonations from "./pages/DonorMyDonations";
import DonorExploreRequests from "./pages/DonorExploreRequests";
import CenterDashboard from "./pages/CenterDashboard";
import CenterExploreDonations from "./pages/CenterExploreDonations";
import CenterOutgoingRequests from "./pages/CenterOutgoingRequests";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/join" element={<Auth />} />
      <Route
        path="/dashboard/donor"
        element={
          <ProtectedRoute allowedRole="DONOR">
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/donor/create"
        element={
          <ProtectedRoute allowedRole="DONOR">
            <DonorCreateDonation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/donor/my-donations"
        element={
          <ProtectedRoute allowedRole="DONOR">
            <DonorMyDonations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/donor/explore"
        element={
          <ProtectedRoute allowedRole="DONOR">
            <DonorExploreRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/center"
        element={
          <ProtectedRoute allowedRole="DISTRIBUTION_CENTER">
            <CenterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/center/explore"
        element={
          <ProtectedRoute allowedRole="DISTRIBUTION_CENTER">
            <CenterExploreDonations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/center/requests"
        element={
          <ProtectedRoute allowedRole="DISTRIBUTION_CENTER">
            <CenterOutgoingRequests />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
