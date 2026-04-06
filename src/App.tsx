import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, AuthGuard } from "@/lib/auth";
import Homepage from "./pages/Homepage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import QueryReview from "./pages/QueryReview";
import ScanRunning from "./pages/ScanRunning";
import ScanResults from "./pages/ScanResults";
import PublicReport from "./pages/PublicReport";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import CookiesPolicy from "./pages/CookiesPolicy";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/report/:shareToken" element={<PublicReport />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/cookies" element={<CookiesPolicy />} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/scan/new" element={<AuthGuard><NewScan /></AuthGuard>} />
            <Route path="/scan/:scanId/queries" element={<AuthGuard><QueryReview /></AuthGuard>} />
            <Route path="/scan/:scanId/running" element={<AuthGuard><ScanRunning /></AuthGuard>} />
            <Route path="/scan/:scanId/results" element={<AuthGuard><ScanResults /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
            <Route path="/~oauth" element={<OAuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
