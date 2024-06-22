import { cn } from "@/lib/utils";
type PageTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};
export default function PageTitle({
  title,
  subtitle,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("@3xl/main:w-7/12 p-3", className)}>
      <h1 className="font-cal text-foreground @3xl/main:text-5xl @xl/main:text-4xl text-2xl">
        {title}
      </h1>
      <p className="text-foreground/80 @3xl/main:text-base @xl/main:text-sm mt-1 line-clamp-2 text-xs">
        {subtitle}
      </p>
    </div>
  );
}
