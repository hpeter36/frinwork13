export function stringToLowerCaseWithoutWhitespace(input: string) {
  const lowercaseString = input.toLowerCase();
  const transformedString = lowercaseString.replace(/\s/g, "_");
  return transformedString;
}

export function stringToId(input: string): string {
  return `${stringToLowerCaseWithoutWhitespace(input)}_${generateRandomInteger(
    100
  )}`;
}

export function generateRandomInteger(max: number): number {
  const randomInteger = Math.floor(Math.random() * (max + 1));
  return randomInteger;
}

export function hexToNormalizedRgb(hex: string) : [number, number, number, number] {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  
  return [r / 255, g / 255, b / 255, 1.0];
  }
  

export type NormalizeColorsInputs = {
  [key: string]: NormalizeColorsInputs | string;
};

export type NormalizedType = {
  [key: string]: NormalizedType | [number, number, number, number];
};

function normalizeColors(colors: NormalizeColorsInputs) {
  let normalized: NormalizedType = {};

  function normalizedColorsSub(
    colors: NormalizeColorsInputs,
    dstColors: NormalizedType
  ) {
    for (let c in colors) {
      const color = colors[c];
      if (typeof color === "string") {
        dstColors[c] = hexToNormalizedRgb(color);
      } else {
        if (!dstColors[c]) dstColors[c] = {} as NormalizedType;
        normalizedColorsSub(color, dstColors[c] as NormalizedType);
      }
    }
  }

  normalizedColorsSub(colors, normalized);
  return normalized;
}
