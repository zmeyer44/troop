export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="center bg-muted/40 flex min-h-screen w-full flex-col">
      {children}
    </div>
  );
}
