import Wrapper from "./Wrapper";
import LogoBlock from "./Logo";
export default function Default({ title }: { title?: string }) {
  return (
    <Wrapper>
      <div tw="w-full h-full flex items-center">
        <div tw="flex-1 h-full flex flex-col justify-start">
          <div
            style={{ color: "#ffffff" }}
            tw="relative flex text-[54px] w-full h-full flex-col justify-between"
          >
            <LogoBlock />
            <div
              tw="flex overflow-hidden"
              style={{
                fontFamily: "cal",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
