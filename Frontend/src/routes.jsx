import { createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx"; 
import NotedetailPage from "./pages/NotedetailPage.jsx";
import CreatePage from "./pages/CreatePage.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <PageNotFound />,
        children: [
            { index: true, element: <HomePage /> }, 
            { path: 'create', element: <CreatePage /> },
            { path: 'note/:id', element: <NotedetailPage /> }
        ]
    }
]);