export function shouldAnimate(mq: { matches: boolean }): boolean {
  return !mq.matches;
}
