import { RouteObject } from "react-router-dom";
import RootLayout from "./components/layouts/RootLayout";
import { Home } from "./components/Home";
import { Dashboard } from "./components/Dashboard";
import { DetailedSimulation } from "./components/DetailedSimulation";
import { Report } from "./components/Report";
import { NotFound } from "./components/NotFound";

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
        path: "*",
        Component: NotFound,
      },
    ],
  },
];
