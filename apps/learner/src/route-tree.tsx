import { createRoute } from "@tanstack/react-router"
import { rootRoute } from "./root"
import { HomePage } from "./pages/HomePage"

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
})
export const routeTree = rootRoute.addChildren([homeRoute])
