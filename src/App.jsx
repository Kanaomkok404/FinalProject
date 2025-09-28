import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
//import Mainpage from './Page/Mainpage';
import TrackingPage from './Page/TrackingPage';
import CalendarPage from './Page/CalendarPage';
import DocPage from './Page/DocPage';
import QuestionPage from './Page/QuestionPage';
//import TestPage from './Page/testpage';
import Sidebar from './Component/Sidebar';
import LoginPage from './Page/LoginPage';
import RegisterPage from './Page/RegisterPage';
import PrivateRoute from './Page/PrivateRoute';
import KeptQuestionsPage from './Page/KeptQuestionsPage';
import './index.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {!hideSidebar && <Sidebar />}
      <div className="flex flex-col flex-grow overflow-auto bg-gray-100 p-4">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
          <Route path="/Doc" element={<PrivateRoute><DocPage /></PrivateRoute>} />
          <Route path="/Question" element={<PrivateRoute><QuestionPage /></PrivateRoute>} />
          <Route path="/" element={<PrivateRoute><TrackingPage /></PrivateRoute>} />
          <Route path="/keeps" element={<PrivateRoute><KeptQuestionsPage /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
