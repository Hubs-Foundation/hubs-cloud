import React from 'react';
import { twMerge } from 'tailwind-merge';

const Divider = ({className = ''}) => {
    const defaultClassName = 'border-b-[1px] w-full mb-4 border-neutral-600/80'
    let classes = twMerge(defaultClassName, className)

    return (
        <div className={classes} />
    )
}

export default Divider;