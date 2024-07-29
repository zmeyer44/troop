import { NextResponse } from "next/server";

const data = {
  names: {
    _: "17717ad4d20e2a425cda0a2195624a0a4a73c4f6975f16b1593fc87fa46f2d58",
    zach: "17717ad4d20e2a425cda0a2195624a0a4a73c4f6975f16b1593fc87fa46f2d58",
  },
};

function handler() {
  const response = new NextResponse(JSON.stringify(data, undefined, 2), {
    status: 200,
  });
  response.headers.append("Content-Type", "application/json");
  response.headers.append("Access-Control-Allow-Origin", "*");
  return response;
}

export { handler as GET, handler as POST };
