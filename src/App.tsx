import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';
import { useEffect } from 'react';
import { useAppDispatch } from './redux/hooks';
import { restoreUser } from './redux/slices/authSlice';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import WritePage from './pages/WritePage';
import PostDetailPage from './pages/PostDetailPage';
import ReviewWritePage from './pages/ReviewWritePage';
import PhishingReportPage from './pages/PhishingReportPage';

function App() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<HomePage />} 
            />
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            <Route 
              path="/signup" 
              element={<SignupPage />} 
            />
            <Route 
              path="/write" 
              element={<WritePage />} 
            />
            <Route 
              path="/review/write" 
              element={<ReviewWritePage />} 
            />
            <Route 
              path="/phishing/report" 
              element={<PhishingReportPage />} 
            />
            <Route 
              path="/post/:id" 
              element={<PostDetailPage />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
