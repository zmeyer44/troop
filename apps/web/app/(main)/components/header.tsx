"use client";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LuPanelLeft, LuSearch } from "react-icons/lu";
import useRoutes from "@/lib/navigation/useRoutes";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import AuthActions from "./authActions";
import Logo from "@/assets/logo";

export default function Header() {
  const { sidebar } = useRoutes();
  const pathname = usePathname();

  const currentRoute = useMemo(
    () => sidebar.routes.find((s) => s.href === pathname),
    [pathname],
  );
  return (
    <header className="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <LuPanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="bg-primary text-primary-foreground group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:text-base"
            >
              <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">troop</span>
            </Link>
            {sidebar.routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5",
                  route.active && "text-foreground",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="center text-muted-foreground hidden gap-x-2 sm:flex">
        <p className="font-cal text-lg leading-none">troop</p>
      </div>
      {/* <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {currentRoute && (
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#"> {currentRoute.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
     <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="#">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Recent Orders</BreadcrumbPage>
          </BreadcrumbItem> 
        </BreadcrumbList>
      </Breadcrumb> */}
      {/* {currentRoute && (
        <div className="hidden md:flex">
          <h2 className="font-cal text-foreground text-2xl">
            {currentRoute.label}
          </h2>
        </div>
      )} */}
      <div className="relative ml-auto flex-1 md:grow-0">
        <LuSearch className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
        <Input
          type="search"
          placeholder="Search..."
          className="bg-background w-full rounded-lg pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      <AuthActions />
    </header>
  );
}
