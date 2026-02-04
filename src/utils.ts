export function randomMinMax (min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function parseCssSize(size: string): { value: number; unit: string } {
  const regex = /^([\d.]+)([a-z%]+)$/i;
  const match = size.match(regex);
  if (!match) {
    throw new Error(`Invalid CSS size: ${size}`);
  }

  return {
    value: parseFloat(match[1]),
    unit: match[2],
  };
} 
