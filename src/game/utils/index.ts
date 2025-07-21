import { Container, Sprite, Texture } from "pixi.js";
import { PaletteSwapFilter } from "../render/filters/palette_swap";

class PaletteManager {
  public texture: Texture | undefined = undefined;

  constructor(t?: Texture) {
    this.texture = t;
  }

  public apply_palette(container: Container | Sprite, row: number) {
    if (this.texture != undefined)
      container.filters = [
        new PaletteSwapFilter({ palette: this.texture, row }),
      ];
  }
}

export function lookAt(a: number, b: number, c: number, d: number) {
  var angle = Math.atan2(d - b, c - a);
  if (angle < 0) angle = Math.PI * 2 + angle;

  return angle;
}

export const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

export const palette = new PaletteManager();

export function circWrap(
  angleInRadians: number,
  circleRadians: number = Math.PI * 2
): number {
  let wrappedAngle = angleInRadians % circleRadians;
  if (wrappedAngle < 0) {
    wrappedAngle += circleRadians;
  }
  return wrappedAngle;
}

/**
 * Smoothly interpolates an angle towards a target angle, wrapping around a circle,
 * moving a fraction of the remaining distance each step.
 *
 * @param currentAngle The current angle in radians.
 * @param targetAngle The target angle in radians.
 * @param interpolationFactor A value between 0 and 1.
 *                            0 means no movement, 1 means instant snap.
 *                            Typical values are small (e.g., 0.1, 0.05) for smooth interpolation.
 * @param circleRadians The total radians in a full circle (usually Math.PI * 2).
 * @returns The new interpolated angle in radians, wrapped within [0, circleRadians).
 */
export function circWrapTo(
  currentAngle: number,
  targetAngle: number,
  interpolationFactor: number, // This is now a factor, not a max step
  circleRadians: number = Math.PI * 2
): number {
  // 1. Normalize angles to be within [0, circleRadians) for consistent diff calculation
  currentAngle = circWrap(currentAngle, circleRadians);
  targetAngle = circWrap(targetAngle, circleRadians);

  // 2. Calculate the difference in both directions
  let diff = targetAngle - currentAngle;

  // 3. Determine the shortest path (ensure diff is between -PI and PI for radians)
  if (diff > circleRadians / 2) {
    diff -= circleRadians; // e.g., target 6.0, current 0.1 -> diff 5.9. Shortest is -0.38
  } else if (diff < -circleRadians / 2) {
    diff += circleRadians; // e.g., target 0.1, current 6.0 -> diff -5.9. Shortest is 0.38
  }

  // 4. Interpolate: move a fraction of the shortest distance
  //    The 'diff' now represents the shortest signed distance to travel.
  const rotationChange = diff * interpolationFactor;

  // 5. Calculate the new angle
  let newAngle = currentAngle + rotationChange;

  // 6. Normalize the new angle again
  return circWrap(newAngle, circleRadians);
}

export function choose(arr: readonly any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function moveTo(current: number, target: number, step: number): number {
  // If we are already at (or very close to) the target, return the target to prevent floating point issues.
  if (Math.abs(target - current) <= step) {
    return target;
  }

  // Determine the direction of movement (1 for positive, -1 for negative)
  // and move the value by the step amount.
  if (target > current) {
    return current + step;
  } else {
    return current - step;
  }
}

/**
 * "Floors" a number to the nearest lower multiple of a threshold.
 * This is the core snapping logic.
 * Example: ground(27, 10) => 20
 *
 * @param value The number to process.
 * @param threshold The grid size to snap to.
 * @returns The snapped value.
 */
export function ground(value: number, threshold: number): number {
  if (threshold === 0) return value;
  // Using Math.floor is more explicit and readable than the original bitwise trick `| 0`
  // and correctly handles negative numbers for all cases.
  return Math.floor(value / threshold) * threshold;
}

/**
 * Snaps a continuous angle (in radians) to a set of discrete directions.
 * This is essential for mapping continuous input (like from a mouse) to
 * a limited set of sprite directions (e.g., 8-directional movement).
 *
 * @param direction The input angle in radians (e.g., from Math.atan2).
 * @param angles The number of discrete directions to snap to. Defaults to 8.
 * @returns The new, snapped angle in radians.
 */
export function groundAngle(direction: number, angles: number = 8): number {
  const TAU = Math.PI * 2; // Full circle in radians

  // 1. Calculate the size of each angular "slice" or sector.
  const sliceSize = TAU / angles; // e.g., for 8 angles, this is PI/4 or 45 degrees.

  // 2. Calculate a half-slice offset to correctly center the snap zones.
  const offset = sliceSize / 2;

  // The original function did not subtract the offset, which is also a valid
  // way to do it, but subtracting it back makes the function's output more intuitive.
  // We will stick to the original's logic for perfect replication.
  // Let's re-implement without the final subtraction to match the original game.

  // Re-implementation matching original's behavior precisely:
  return ground(direction + offset, sliceSize);
}

// --- Example Usage ---

// Convert degrees to radians for easier testing
export const toRad = (deg: number) => deg * (Math.PI / 180);
