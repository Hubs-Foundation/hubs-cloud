// Used to avoid SSR issues when building this app for production.
export const isBrowser = typeof window !== "undefined";

export const clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max);
}

export const linearScale = (factor, minInput, maxInput, minOutput, maxOutput, shouldClamp = true) => {
    if (shouldClamp) {
        factor = clamp(factor, minInput, maxInput);
    }

    return minOutput + (maxOutput - minOutput) *
        (factor - minInput) / (maxInput - minInput);
}
