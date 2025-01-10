import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import CoinList from './components/coins/CoinList';
import CoinDetails from './components/coins/CoinDetails';
import { DarkModeProvider } from './context/DarkModeContext';

function PrivateRoute({ children }) {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <CoinList />
              </PrivateRoute>
            }
          />
          <Route
            path="/coin/:symbol"
            element={
              <PrivateRoute>
                <CoinDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
