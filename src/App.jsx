import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeDashboard from "./pages/HomeDashboard";
import BooksList from "./pages/BooksList";
import AddEditBook from "./pages/AddEditBook";
import BookDetails from "./pages/BookDetails";
import Members from "./pages/Members";
import AddMember from "./pages/AddMember";
import Borrowings from "./pages/Borrowings";
import AddBorrowing from "./pages/AddBorrowing";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BooksList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/new"
            element={
              <ProtectedRoute>
                <AddEditBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id/edit"
            element={
              <ProtectedRoute>
                <AddEditBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/new"
            element={
              <ProtectedRoute>
                <AddMember />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrowings"
            element={
              <ProtectedRoute>
                <Borrowings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrowings/new"
            element={
              <ProtectedRoute>
                <AddBorrowing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
