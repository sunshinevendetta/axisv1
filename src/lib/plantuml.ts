import { deflateRawSync } from "node:zlib";

const PLANTUML_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

function append3bytes(b1: number, b2: number, b3: number) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3f;

  return (
    PLANTUML_ALPHABET.charAt(c1 & 0x3f) +
    PLANTUML_ALPHABET.charAt(c2 & 0x3f) +
    PLANTUML_ALPHABET.charAt(c3 & 0x3f) +
    PLANTUML_ALPHABET.charAt(c4 & 0x3f)
  );
}

function encode6bitBuffer(buffer: Buffer) {
  let output = "";

  for (let i = 0; i < buffer.length; i += 3) {
    const b1 = buffer[i] ?? 0;
    const b2 = buffer[i + 1] ?? 0;
    const b3 = buffer[i + 2] ?? 0;

    output += append3bytes(b1, b2, b3);
  }

  return output;
}

export function encodePlantUml(source: string) {
  const compressed = deflateRawSync(Buffer.from(source, "utf8"), {
    level: 9,
  });

  return encode6bitBuffer(compressed);
}

export function getPlantUmlSvgUrl(source: string) {
  return `https://www.plantuml.com/plantuml/svg/${encodePlantUml(source)}`;
}
