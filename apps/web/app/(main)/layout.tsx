import { Button } from "@/components/ui/button";
import Navigation from "./components/navigation";
import { IoArrowUpOutline } from "react-icons/io5";
import MobileNavigation from "./components/mobileNavigation";
import Header from "./components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/40 flex min-h-screen w-full flex-col">
      <Navigation />
      <div className="@container/main flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        {children}
      </div>
    </div>
  );
}
