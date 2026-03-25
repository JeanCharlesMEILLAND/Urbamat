import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip admin, api, _next, static files
  matcher: [
    "/((?!api|admin|_next|_vercel|images|fonts|favicon\\.ico|.*\\..*).*)",
  ],
};
