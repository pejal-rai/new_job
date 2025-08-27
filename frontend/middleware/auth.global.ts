import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return;

  const { $pinia } = useNuxtApp();
  const userStore = useUserStore($pinia);

  const publicRoutes = ["/login", "/register", "/verify-email"];
  const isPublicRoute = publicRoutes.includes(to.path);

  // Check if a fetch is in progress or user is already authenticated
  if (userStore.isLoading || userStore.isAuthenticated) {
    console.log("Skipping fetchUser, already authenticated or loading:", {
      isAuthenticated: userStore.isAuthenticated,
      isLoading: userStore.isLoading,
      path: to.path,
    });
  } else if (!isPublicRoute) {
    console.log("Fetching user for route:", to.path);
    await userStore.fetchUser();
  }

  // Ensure company is fetched for employers
  if (userStore.isAuthenticated && userStore.user?.role === "employer" && !userStore.company) {
    await userStore.fetchCompany();
  }

  const isAuthenticated = userStore.isAuthenticated;

  console.log("Middleware - User:", userStore.user);
  console.log("Middleware - IsAuthenticated:", isAuthenticated);
  console.log("Middleware - IsEmployer:", userStore.isEmployer());
  console.log("Middleware - To:", to.path);

  if (!isAuthenticated && !isPublicRoute) {
    console.log("Redirecting to /login from:", to.path);
    return navigateTo("/login");
  }

  if (isAuthenticated && isPublicRoute) {
    console.log("Redirecting to / from:", to.path);
    return navigateTo("/");
  }

  if (to.path.startsWith("/employer")) {
    if (to.path === "/employer/apply" && userStore.user?.role === "user") {
      return; // Allow users to access apply page
    }
    if (!userStore.isEmployer()) {
      console.log("Non-employer, redirecting to / from:", to.path);
      return navigateTo("/");
    }
  }

  if (to.path.startsWith("/admin") && userStore.user?.role !== "admin") {
    console.log("Non-admin, redirecting to / from:", to.path);
    return navigateTo("/");
  }
});