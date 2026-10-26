export function courseCount(summary) {
  return summary.filter(({ count }) => count > 0).length;
}
