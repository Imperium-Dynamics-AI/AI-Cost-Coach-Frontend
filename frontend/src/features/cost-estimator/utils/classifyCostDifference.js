export function classifyCostDifference(
  monthlyTotal,
  baselineTotal,
  isBaseline = false,
) {
  if (!Number.isFinite(monthlyTotal) || !Number.isFinite(baselineTotal)) {
    return "unavailable";
  }

  if (isBaseline) {
    return "baseline";
  }

  const difference = monthlyTotal - baselineTotal;
  if (Math.abs(difference) < 0.005) {
    return "same";
  }

  return difference < 0 ? "cheaper" : "pricier";
}
