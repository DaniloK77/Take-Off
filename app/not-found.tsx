import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found",
};

const NotFound = () => (
  <NotFoundView
    title="This page missed its flight"
    description="The page you're looking for doesn't exist or has moved. Let's get you back on course."
  />
);

export default NotFound;
