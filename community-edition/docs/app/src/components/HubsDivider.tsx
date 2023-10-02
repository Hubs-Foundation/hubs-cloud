import { StaticImage } from 'gatsby-plugin-image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

export const HubsDivider = ({ className = '' }) => {
    const defaultClassName = 'w-full flex items-center justify-center gap-12';
    let classes = twMerge(defaultClassName, className);

    return (
        <div className={classes}>
            <div className='h-[1px] w-1/5 bg-neutral-600/80' />
            <StaticImage quality={100} className="w-12 h-12" src="../images/hubs.png" alt="The Hubs logo is light blue and light purple in the shape of an abstract duck turned on its side." />
            <div className='h-[1px] w-1/5 bg-neutral-600/80' />
        </div>
    )
}
