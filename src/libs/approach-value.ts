export function approachValue(fGoal: number, fCurrent: number, fStep: number): number {
    if (fGoal === fCurrent) {
        return fGoal;
    }
    if (Math.abs(fGoal - fCurrent) <= fStep) {
        return fGoal;
    } else if (fCurrent < fGoal) {
        return fCurrent + fStep;
    } else if (fCurrent > fGoal) {
        return fCurrent - fStep;
    }
}
