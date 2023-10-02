import React from 'react';
import { ThemeToggleSwitch } from './ToggleThemeSwitch';

export const Footer = ({ }) => {
    return (
        <footer className='w-full bg-slate-200 dark:bg-neutral-800 relative p-2 flex justify-between items-center'>
            <div className='text-sm opacity-70 hover:opacity-100 transition-all'>
                <a className='font-semibold hover:underline text-blue-900 dark:text-blue-100' target="_blank" href='https://github.com/zfox23/hubs/tree/ce-docs/docs-community-edition'><code>docs-community-edition</code></a> created by <a className='font-semibold hover:underline' target="_blank" href='https://hubs.mozilla.com'>the ducks at Mozilla Hubs</a>
            </div>
            <ThemeToggleSwitch />
        </footer>
    )
}