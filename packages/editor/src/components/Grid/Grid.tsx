import { FC } from "react";

import { Size } from "../../types";

const Grid: FC<Size> = ({ width, height }) => {
  return (
    <svg
      style={{
        width,
        height,
        position: "absolute",
        zIndex: "-3",
      }}
    >
      <defs>
        <pattern id="grid" width="96" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M4 0V8M0 4H8"
            stroke="#47525C"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
};

export default Grid;
