import Wrapper from "./Wrapper";
import LogoBlock from "./Logo";

export default function Event({
  title,
  image,
}: {
  title: string;
  image?: string;
}) {
  return (
    <Wrapper>
      <div tw="w-full h-full flex items-center">
        <div
          style={{
            marginRight: 20,
          }}
          tw="flex-1 h-full flex flex-col justify-start"
        >
          <div
            style={{ color: "#ffffff" }}
            tw="relative flex text-[54px] w-full h-full flex-col justify-between"
          >
            <div
              tw="flex overflow-hidden"
              style={{
                fontFamily: "cal",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </div>

            <LogoBlock />
          </div>
        </div>
        {image && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "40px",
              boxShadow: "0px 7px 14px 0px #1512158e",
              backgroundColor: "#151215",
              overflow: "hidden",
              width: "450px",
              height: "450px",
            }}
          >
            <img
              src={image}
              alt="image"
              style={{
                objectPosition: "center",
                objectFit: "contain",
                overflow: "hidden",
                height: "100%",
              }}
            />
          </div>
        )}
      </div>
    </Wrapper>
  );
}
