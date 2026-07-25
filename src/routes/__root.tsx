
      
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="min-h-screen bg-[#090B10] text-white antialiased">
          <Outlet />
          <Scripts />
          <TanStackRouterDevtools position="bottom-right" />
        </body>
      </html>
    </>
  );
}
