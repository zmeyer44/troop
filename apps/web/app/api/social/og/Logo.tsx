import Logo from "@/assets/logo";
export default function LogoBlock({ title }: { title?: string }) {
  return (
    <div
      style={{ color: "#e0e0e0ad" }}
      tw="relative flex items-center text-center text-[54px]"
    >
      <Logo
        style={{
          width: 60,
          height: 60,
          marginRight: 20,
        }}
      />
      <div
        tw="flex overflow-hidden items-center"
        style={{
          fontFamily: "cal",
          textOverflow: "ellipsis",
          marginBottom: 10,
        }}
      >
        {title ?? "troop"}
      </div>
    </div>
  );
}
