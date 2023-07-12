export function stringToLowerCaseWithoutWhitespace(input: string) {
  const lowercaseString = input.toLowerCase();
  const transformedString = lowercaseString.replace(/\s/g, "_");
  return transformedString
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
