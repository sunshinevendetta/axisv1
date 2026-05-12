const address = process.env.NEXT_PUBLIC_AXISFORM_ADDRESS;

if (!address) {
  throw new Error('NEXT_PUBLIC_AXISFORM_ADDRESS is missing in .env');
}

export const AXISFORM_ADDRESS = address as `0x${string}`;