import { describe, it, expect } from "vitest";
import {
  TREATMENTS,
  matchTreatment,
  normalizeSeverity,
  computePersonalizedMid,
  computePersonalizedRange,
  computeFinalEstimate,
  RANGE_SPREAD,
  FINAL_BUFFER,
} from "./costEstimator";

describe("costEstimator", () => {
  it("treatment data matches the published base ranges", () => {
    const heart = TREATMENTS.find((t) => t.key === "heart-surgery");
    expect(heart?.india).toEqual([4500, 7500]);
    const dental = TREATMENTS.find((t) => t.key === "dental-implants");
    expect(dental?.india).toEqual([600, 1500]);
  });

  it("maps symptom keywords to the right treatment", () => {
    expect(matchTreatment("severe cardiac blockage").key).toBe("heart-surgery");
    expect(matchTreatment("knee joint pain").key).toBe("knee-replacement");
    expect(matchTreatment("breast cancer staging").key).toBe("cancer");
    expect(matchTreatment("unknown condition").key).toBe("heart-surgery");
  });

  it("normalizes severity wording", () => {
    expect(normalizeSeverity("mild discomfort")).toBe("Mild");
    expect(normalizeSeverity("critical condition")).toBe("Severe");
    expect(normalizeSeverity("something else")).toBe("Moderate");
  });

  it("Stage 2 midpoint: heart surgery, Moderate, Hyderabad, Standard, Private, no previous surgery", () => {
    // (4500 + 7500) / 2 = 6000; Hyderabad multiplier 0.92
    const mid = computePersonalizedMid({
      treatmentKey: "heart-surgery",
      severity: "Moderate",
      city: "Hyderabad",
      category: "Standard",
      room: "Private",
      previousSurgery: false,
    });
    expect(mid).toBeCloseTo(6000 * 0.92, 6);
  });

  it("applies every multiplier, including previous-surgery uplift", () => {
    // Knee: (4000 + 6500) / 2 = 5250
    const mid = computePersonalizedMid({
      treatmentKey: "knee-replacement",
      severity: "Mild",
      city: "Delhi",
      category: "Budget",
      room: "Shared",
      previousSurgery: true,
    });
    const expected = 5250 * 0.85 * 1.05 * 0.82 * 0.95 * 1.08;
    expect(mid).toBeCloseTo(expected, 6);
  });

  it("unknown option values fall back to a neutral multiplier", () => {
    const mid = computePersonalizedMid({
      treatmentKey: "ivf",
      severity: "Extreme",
      city: "Goa",
      category: "Ultra",
      room: "Suite",
      previousSurgery: false,
    });
    expect(mid).toBeCloseTo(3500, 6);
  });

  it("Stage 2 range is midpoint ± 9%", () => {
    const [lo, hi] = computePersonalizedRange(5520);
    expect(lo).toBeCloseTo(5520 * (1 - RANGE_SPREAD), 6);
    expect(hi).toBeCloseTo(5520 * (1 + RANGE_SPREAD), 6);
  });

  it("Stage 3 detailed estimate is the midpoint plus the 2% buffer", () => {
    expect(computeFinalEstimate(5520)).toBeCloseTo(5520 * (1 + FINAL_BUFFER), 6);
    expect(computeFinalEstimate(1000)).toBeCloseTo(1020, 6);
  });
});
