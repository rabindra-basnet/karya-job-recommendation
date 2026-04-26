import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_job")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
