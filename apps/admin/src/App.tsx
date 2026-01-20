import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CategoriesPage } from './pages/services/CategoriesPage';
import { CategoryEditPage } from './pages/services/CategoryEditPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { ServiceEditPage } from './pages/services/ServiceEditPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { ProjectEditPage } from './pages/projects/ProjectEditPage';
import { ArticlesPage } from './pages/articles/ArticlesPage';
import { ArticleEditPage } from './pages/articles/ArticleEditPage';
import { RequestsPage } from './pages/requests/RequestsPage';
import { EmployeesPage } from './pages/employees/EmployeesPage';
import { EmployeeEditPage } from './pages/employees/EmployeeEditPage';
import { ReviewsPage } from './pages/reviews/ReviewsPage';
import { ReviewEditPage } from './pages/reviews/ReviewEditPage';
import { VacanciesPage } from './pages/vacancies/VacanciesPage';
import { VacancyEditPage } from './pages/vacancies/VacancyEditPage';
import { FaqPage } from './pages/faq/FaqPage';
import { FaqEditPage } from './pages/faq/FaqEditPage';
import { MediaLibraryPage } from './pages/media/MediaLibraryPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ConfigProvider locale={ruRU}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/services/categories" element={<CategoriesPage />} />
                      <Route path="/services/categories/:id" element={<CategoryEditPage />} />
                      <Route path="/services/list" element={<ServicesPage />} />
                      <Route path="/services/:id" element={<ServiceEditPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/:id" element={<ProjectEditPage />} />
                      <Route path="/articles" element={<ArticlesPage />} />
                      <Route path="/articles/:id" element={<ArticleEditPage />} />
                      <Route path="/requests" element={<RequestsPage />} />
                      <Route path="/employees" element={<EmployeesPage />} />
                      <Route path="/employees/:id" element={<EmployeeEditPage />} />
                      <Route path="/reviews" element={<ReviewsPage />} />
                      <Route path="/reviews/:id" element={<ReviewEditPage />} />
                      <Route path="/vacancies" element={<VacanciesPage />} />
                      <Route path="/vacancies/:id" element={<VacancyEditPage />} />
                      <Route path="/faq" element={<FaqPage />} />
                      <Route path="/faq/:id" element={<FaqEditPage />} />
                      <Route path="/media" element={<MediaLibraryPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;
