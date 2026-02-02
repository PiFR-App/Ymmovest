import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import { Home } from "./components/Home";
import { Dashboard } from "./components/Dashboard";
import { DetailedSimulation } from "./components/DetailedSimulation";
import { Report } from "./components/Report";
import { Login } from "./components/Login";
import { AdminPanel } from "./components/AdminPanel";
import { CitiesManagement } from "./components/CitiesManagement";
import { NotFound } from "./components/NotFound";
import SwaggerUIComponent from "./components/SwaggerUiComponent";
import { UsersManagement } from "./components/UsersManagement";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="simulation" element={<DetailedSimulation />} />
          <Route path="report" element={<Report />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="admin/communes" element={<CitiesManagement />} />
          <Route path="admin/users" element={<UsersManagement />} />
            <Route path="admin/docs" element={<SwaggerUIComponent/>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
