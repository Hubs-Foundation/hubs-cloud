// Adapted from https://usehooks.com/useEventListener/
import { useRef, useEffect } from "react";

const isBrowser = typeof window !== "undefined";
export function useEventListener(eventName, handler, element: React.RefObject<HTMLDivElement | HTMLCanvasElement>) {
    // Create a ref that stores handler
    const savedHandler = useRef<any>();

    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        // Make sure element supports addEventListener
        // On
        const isSupported = element && element.current && element.current.addEventListener;
        if (!isSupported) return;

        // Create event listener that calls handler function stored in ref
        const eventListener = (event) => {
            if (!(savedHandler && savedHandler.current)) {
                return;
            }
            savedHandler.current(event);
        }

        // Add event listener
        element.current.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            element && element.current && element.current.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element] // Re-run if eventName or element changes
    );
}

export function useEventListenerWindow(eventName, handler) {
    if (!isBrowser) {
        return;
    }

    // Create a ref that stores handler
    const savedHandler = useRef<any>();
    // Update ref.current value if handler changes.
    // This allows our effect below to always get latest handler ...
    // ... without us needing to pass it in effect deps array ...
    // ... and potentially cause effect to re-run every render.
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        // Make sure window supports addEventListener
        // On
        const isSupported = window && window.addEventListener;
        if (!isSupported) {
            console.warn(`\`window\` does not support \`addEventListener()\`!`);
            return;
        }

        // Create event listener that calls handler function stored in ref
        const eventListener = (event) => {
            if (!(savedHandler && savedHandler.current)) {
                return;
            }
            savedHandler.current(event);
        }

        // Add event listener
        window.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            window && window.removeEventListener(eventName, eventListener);
        };
    }, [eventName, window] // Re-run if eventName or window changes
    );
}
