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
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import Footer from './components/Footer';

function App() {
  const dispatch = useAppDispatch();

  // 앱이 시작될 때, 사용자 세션을 복원.
  useEffect(() => {
    dispatch(restoreUser());
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50" style={{ paddingBottom: '70px' }}>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/review/write" element={<ReviewWritePage />} />
            <Route path="/phishing/report" element={<PhishingReportPage />} />
            <Route path="/post/:id" element={<PostDetailPage />} />
            <Route path="/auth/callback" element={<GoogleAuthCallback />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;