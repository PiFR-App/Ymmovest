import { RouteObject } from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import { Home } from "./components/Home";
import { Dashboard } from "./components/Dashboard";
import { DetailedSimulation } from "./components/DetailedSimulation";
import { Report } from "./components/Report";
import { NotFound } from "./components/NotFound";
import { Login } from "./components/Login";
import { Admin } from "./components/Admin";

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
        path: "admin",
        Component: Login,
      },
      {
        path: "admin/communes",
        Component: Admin,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
];
