import React, { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useEventListenerWindow } from '../hooks/useEventListener';
const isBrowser = typeof window !== "undefined";

export const isDarkThemeEnabled = () => {
    if (!isBrowser) {
        return false;
    }

    return (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));
}

export const enableDarkTheme = (enabled, save = true) => {
    if (!isBrowser) {
        return;
    }

    if (enabled && save) {
        localStorage.theme = 'dark';
    } else if (save) {
        localStorage.theme = 'light';
    }

    if (enabled) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    const evt = new CustomEvent("darkThemeChanged", { "detail": enabled });
    window.dispatchEvent(evt);
}

export const ThemeToggleSwitch = ({ isLarge = false, className = "" }) => {
    const [darkThemeEnabled, setDarkThemeEnabled] = useState(isDarkThemeEnabled());

    useEventListenerWindow("darkThemeChanged", (evt) => {
        setDarkThemeEnabled(evt.detail);
    });

    const switchTheme = (darkThemeNewlyEnabled) => {
        enableDarkTheme(darkThemeNewlyEnabled);
        setDarkThemeEnabled(darkThemeNewlyEnabled);
    }

    useEffect(() => {
        if (!isBrowser) {
            return;
        }

        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            enableDarkTheme(true);
        } else {
            enableDarkTheme(false);
        }
    })

    return (
        <Switch.Group>
            <div className={`${twMerge("flex items-center text-slate-900 dark:text-slate-50", className)}`}>
                <Switch.Label onClick={(e) => { switchTheme(false); e.preventDefault(); }} className={`mr-2 ${isLarge ? 'h-9 w-9' : 'h-6 w-6'} cursor-pointer`}><SunIcon /></Switch.Label>
                <Switch
                    checked={darkThemeEnabled}
                    onChange={switchTheme}
                    className={`themeSwitch ${darkThemeEnabled ? 'bg-indigo-800' : 'bg-blue-400'
                        } relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-indigo-700 focus:ring-offset-0 ${isLarge ? 'h-8 w-14' : 'h-5 w-9'}`}
                >
                    <span
                        className={`${darkThemeEnabled ? (isLarge ? 'translate-x-8' : 'translate-x-5') : 'translate-x-1'
                            } inline-block ${isLarge ? 'h-5 w-5' : 'h-3 w-3'} transform rounded-full bg-white transition-transform`}
                    />
                </Switch>
                <Switch.Label onClick={(e) => { switchTheme(true); e.preventDefault(); }} className={`ml-2 ${isLarge ? 'h-8 w-8' : 'h-5 w-5'} cursor-pointer`}><MoonIcon /></Switch.Label>
            </div>
        </Switch.Group>
    )
}