// Route preservation utilities for maintaining user's current page during authentication flows

/**
 * Stores the current route in sessionStorage if it's a role-based route or a return URL
 * @param currentPath - The current pathname to potentially store
 */
export const storeCurrentRouteIfNeeded = (currentPath: string): void => {
  // Check for returnUrl query parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get("returnUrl");

  if (returnUrl) {
    sessionStorage.setItem("lastVisitedRoute", returnUrl);
    console.log("RouteUtils - Stored returnUrl for restoration:", returnUrl);
    return;
  }

  // Also store apply routes and job routes
  if (
    currentPath.startsWith("/admin/") ||
    currentPath.startsWith("/interviewer/") ||
    currentPath.startsWith("/hiring-manager/") ||
    currentPath.startsWith("/candidate/") ||
    currentPath.startsWith("/apply/") ||
    currentPath.startsWith("/jobs/")
  ) {
    sessionStorage.setItem("lastVisitedRoute", currentPath);
    console.log("RouteUtils - Stored route for restoration:", currentPath);
  }
};

/**
 * Retrieves and validates a stored route for the given user role
 * @param userRole - The user's role to validate against
 * @returns The stored route if valid for the role, null otherwise
 */
export const getStoredRouteForRole = (userRole: string): string | null => {
  const storedRoute = sessionStorage.getItem("lastVisitedRoute");

  if (!storedRoute) {
    return null;
  }

  // Normalize role
  const normalizedRole = userRole.replace("ROLE_", "").toUpperCase();

  // Apply and jobs routes are valid for any authenticated user (especially candidates)
  if (storedRoute.startsWith("/apply/") || storedRoute.startsWith("/jobs/")) {
    console.log("RouteUtils - Apply/Jobs route found:", storedRoute);
    return storedRoute;
  }

  // Check if stored route is valid for the user's role
  let isValidRoute = false;

  switch (normalizedRole) {
    case "ADMIN":
      isValidRoute = storedRoute.startsWith("/admin/");
      break;
    case "INTERVIEWER":
      isValidRoute = storedRoute.startsWith("/interviewer/");
      break;
    case "HIRING_MANAGER":
      isValidRoute = storedRoute.startsWith("/hiring-manager/");
      break;
    case "CANDIDATE":
      isValidRoute = storedRoute.startsWith("/candidate/");
      break;
  }

  if (isValidRoute) {
    console.log(
      "RouteUtils - Valid stored route found for role",
      normalizedRole,
      ":",
      storedRoute
    );
    return storedRoute;
  }

  console.log("RouteUtils - Stored route not valid for role", normalizedRole);
  return null;
};

/**
 * Clears the stored route from sessionStorage
 */
export const clearStoredRoute = (): void => {
  sessionStorage.removeItem("lastVisitedRoute");
  console.log("RouteUtils - Cleared stored route");
};

/**
 * Gets the default dashboard path for a user role
 * @param userRole - The user's role
 * @returns The default dashboard path for the role
 */
export const getDefaultDashboardPath = (userRole: string): string => {
  const normalizedRole = userRole.replace("ROLE_", "").toUpperCase();

  switch (normalizedRole) {
    case "ADMIN":
      return "/admin";
    case "INTERVIEWER":
      return "/interviewer";
    case "HIRING_MANAGER":
      return "/hiring-manager";
    case "CANDIDATE":
      return "/candidate";
    default:
      return "/dashboard";
  }
};

/**
 * Gets the target route for a user - either stored route or default dashboard
 * @param userRole - The user's role
 * @returns The target route to navigate to
 */
export const getTargetRouteForUser = (userRole: string): string => {
  const storedRoute = getStoredRouteForRole(userRole);

  if (storedRoute) {
    clearStoredRoute(); // Clear after using
    return storedRoute;
  }

  return getDefaultDashboardPath(userRole);
};
