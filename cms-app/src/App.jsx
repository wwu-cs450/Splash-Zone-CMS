import { BrowserRouter, Routes, Route } from 'react-router';
import AnalyticsPage from './pages/analytics-page';
import CustomerListPage from './pages/customer-list-page';
import CustomerSearchPage from './pages/customer-search-page';
import LoginPage from './pages/login-page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/" element={<CustomerSearchPage />} /> {/* Add this line */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;