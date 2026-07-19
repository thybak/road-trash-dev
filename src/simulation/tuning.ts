// Phase 2 arcade tuning constants. Values are hypotheses; units are part of each name.
// See docs/roadmap/phase-2-road-prototype.md for the playtest evidence that may change them.

/** Simulation step duration in seconds. */
export const STEP_S = 1 / 60;

/** Maximum simulation steps per Phaser frame to avoid spiral-of-death. */
export const MAX_STEPS_PER_FRAME = 5;

/** Maximum rider speed on asphalt in metres per second. */
export const MAX_SPEED_MPS = 35;

/** Acceleration when throttle is held in metres per second squared. */
export const ACCEL_MPS2 = 12;

/** Braking deceleration in metres per second squared. */
export const BRAKE_DECEL_MPS2 = 20;

/** Coasting/friction deceleration in metres per second squared. */
export const COAST_DECEL_MPS2 = 2;

/** Lateral movement speed at full steer in metres per second. */
export const STEER_LATERAL_MPS = 8;

/** Curvature lateral pull multiplier: pull = curvature * speed^2 * FACTOR. */
export const CURVATURE_LATERAL_PULL_FACTOR = 0.01;

/** Distance beyond halfWidthM at which off-road slowdown is fully applied. */
export const OFF_ROAD_FULL_PENALTY_WIDTH_M = 8;

/** Speed multiplier when fully off-road (0 = stop, 1 = no penalty). */
export const OFF_ROAD_SPEED_FACTOR = 0.8;

/** Default road half-width in metres. */
export const ROAD_HALF_WIDTH_M = 6;

/** Camera distance behind the rider in metres. */
export const CAMERA_DISTANCE_BEHIND_M = 8;

/** Camera height above the road in metres. */
export const CAMERA_HEIGHT_M = 3;

/** Camera look-ahead distance in metres. */
export const CAMERA_LOOK_AHEAD_M = 12;

/** Vertical look-above-rider offset so the rider appears in the lower half of the screen. */
export const CAMERA_LOOK_VERTICAL_OFFSET_M = 0.6;

/** Base road segment draw length in metres (not all tracks must use this). */
export const SEGMENT_LENGTH_M = 10;

/** How far ahead of the rider to draw road segments in metres. */
export const ROAD_DRAW_DISTANCE_M = 200;

/** Interval between roadside posts in metres. */
export const POST_INTERVAL_M = 40;

/** How far outside the road edge posts are placed in metres. */
export const POST_OFFSET_FROM_EDGE_M = 2;

/** Post visual width in metres at the post's location. */
export const POST_WIDTH_M = 0.4;

/** Post visual height in metres at the post's location. */
export const POST_HEIGHT_M = 2.5;

/** Lean angle per unit lateral speed in radians. */
export const LEAN_RAD_PER_LATERAL_MPS = 0.05;

/** Maximum lean angle in radians. */
export const MAX_LEAN_RAD = 0.4;
