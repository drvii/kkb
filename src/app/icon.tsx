import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Quicksand",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: -0.3,
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
