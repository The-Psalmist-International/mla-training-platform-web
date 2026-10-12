import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root"

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./pages/HomePage"), "HomePage"),
})
export const routeTree = rootRoute.addChildren([homeRoute])
