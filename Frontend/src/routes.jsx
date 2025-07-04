import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import NotedetailPage from "./pages/NotedetailPage.jsx";
import CreatePage from "./pages/CreatePage.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import Signup from "./components/Signup.jsx";
import Login from "./components/Login.jsx";
import Home from "./pages/Home.jsx";
import AllNotes from "./pages/AllNotes.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx"; // adjust path

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <PageNotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "sign-up", element: <Signup /> },
      { path: "log-in", element: <Login /> },

      // Protected Routes
      {
        element: <PrivateRoute />,
        children: [
          { path: "all-notes", element: <AllNotes /> },
          { path: "create", element: <CreatePage /> },
          { path: "note/:id", element: <NotedetailPage /> },
        ],
      },
    ],
  },
]);
