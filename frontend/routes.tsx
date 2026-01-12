import { RouteObject } from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import { Home } from "./components/Home";
import { Dashboard } from "./components/Dashboard";
import { DetailedSimulation } from "./components/DetailedSimulation";
import { Report } from "./components/Report";
import { NotFound } from "./components/NotFound";
import { Login } from "./components/Login";
import { AdminPanel } from "./components/AdminPanel";
import { CitiesManagement } from "./components/CitiesManagement";
import { UsersManagement } from "./components/UsersManagement";
import ApiDocs from "./components/Swagger";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "simulation",
        Component: DetailedSimulation,
      },
      {
        path: "report",
        Component: Report,
      },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "admin",
        Component: AdminPanel,
      },
      {
        path: "admin/communes",
        Component: CitiesManagement,
      },
      {
        path: "admin/users",
        Component: UsersManagement,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
];
