import { createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Console log forwarding for dev
if (import.meta.env.DEV && typeof window !== "undefined") {
  void import("virtual:console-log-client");
}

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},

    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
