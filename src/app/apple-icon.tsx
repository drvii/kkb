import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const quicksandBold = await readFile(join(process.cwd(), "src/assets/Quicksand-Bold.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Quicksand",
            fontWeight: 700,
            fontSize: 84,
            letterSpacing: -1.7,
            color: "#fcfcfc",
          }}
        >
          k<span style={{ color: "#3d7cff" }}>.</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Quicksand", data: quicksandBold, style: "normal", weight: 700 }],
    },
  );
}
