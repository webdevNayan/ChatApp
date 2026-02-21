"use client";

import { useEffect, useState } from "react";

/**
 * useDebounce Hook
 * 
 * Delays updating the value until after a specified delay has passed.
 * Commonly used for search inputs to prevent excessive API calls.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
