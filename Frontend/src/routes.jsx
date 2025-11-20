import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import NotedetailPage from "./pages/NotedetailPage.jsx";
import CreatePage from "./pages/CreatePage.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import Home from "./pages/Home.jsx";
import AllNotes from "./pages/AllNotes.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import OTPVerification from "./components/OTPVerification.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <PageNotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "sign-up", element: <Signup /> },
      { path: "log-in", element: <Login /> },
      { path: "verify-otp", element: <OTPVerification /> },

      // Forgot + Reset Password Routes
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password/:token", element: <ResetPassword /> },

      // Protected Routes
      {
        element: <PrivateRoute />,
        children: [
          { path: "all-notes", element: <AllNotes /> },
           { path: "all-notes/:folderId", element: <AllNotes /> },
          { path: "create", element: <CreatePage /> },
          { path: "note/:id", element: <NotedetailPage /> },
        ],
      },
    ],
  },
]);
