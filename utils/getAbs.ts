/**
 * Get absolute value from a given number
 * @param {bigint} value Value to get absolute from
 * @returns {bigint} Absolute value
 */
export default function getAbs(value: bigint): bigint {
  return value < 0 ? -value : value;
}
