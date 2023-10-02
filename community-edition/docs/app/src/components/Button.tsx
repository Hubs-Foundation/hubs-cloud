import { Link } from 'gatsby';
import React, { MouseEventHandler } from 'react';
import { twMerge } from 'tailwind-merge';

export enum ButtonTypes {
    Button,
    ALink,
    Link
}


export const Button = ({ className = "", buttonType = undefined, onClick = undefined, buttonText = undefined, buttonIconLeft = null, buttonIconRight = null, filled = true, disabled = false, type = ButtonTypes.Button, linkTarget = "_blank" }: {
    className?: string,
    buttonType?: "button" | "submit" | "reset" | undefined,
    onClick?: undefined | MouseEventHandler<HTMLButtonElement> | string,
    buttonText?: any,
    buttonIconLeft?: any,
    buttonIconRight?: any,
    filled?: boolean,
    disabled?: boolean,
    type?: ButtonTypes,
    linkTarget?: string
}) => {
    let defaultClasses = `transition-all duration-75 group text-lg font-semibold box-border min-h-[41px] flex items-center justify-center py-1 px-2 rounded-md active:translate-x-[2px] active:translate-y-[2px] ${disabled ? 'bg-neutral-400 text-neutral-300 cursor-not-allowed' : filled ? 'hover:underline bg-blue-700 dark:bg-indigo-700 hover:bg-blue-800 dark:hover:bg-indigo-800 text-slate-50' : 'text-blue-800 dark:text-indigo-800 hover:underline bg-neutral-50'}`;
    let classes = twMerge(defaultClasses, className);

    if (type === ButtonTypes.ALink) {
        return (
            <div
                className={`transition-{transform, opacity, scale} duration-700`}>
                <a
                    href={onClick as string}
                    target={linkTarget}
                    className={classes}>
                    <div className='relative flex items-center justify-center'>
                        <div className='relative flex justify-center items-center'>{buttonIconLeft}</div>
                        {buttonText ?
                            <span className='relative -top-0.5 h-6 mx-2 flex justify-center items-center'>{buttonText}</span> : null
                        }
                        <div className='relative flex justify-center items-center'>{buttonIconRight}</div>
                    </div>
                </a>
            </div>
        )
    } else if (type === ButtonTypes.Link) {
        return (
            <Link
                to={onClick as string}
                className={classes}>
                <div className='relative flex items-center justify-center'>
                    <div className='relative flex justify-center items-center'>{buttonIconLeft}</div>
                    {buttonText ?
                        <span className='relative -top-0.5 h-6 mx-2 flex justify-center items-center'>{buttonText}</span> : null
                    }
                    <div className='relative flex justify-center items-center'>{buttonIconRight}</div>
                </div>
            </Link>
        )
    } else {
        return (
            <button
                type={buttonType || "button"}
                disabled={disabled}
                onClick={onClick as undefined | MouseEventHandler<HTMLButtonElement>}
                className={classes}>
                <div className='relative flex items-center justify-center'>
                    <div className='relative flex justify-center items-center'>{buttonIconLeft}</div>
                    {buttonText ?
                        <span className='relative -top-0.5 h-6 mx-2 flex justify-center items-center'>{buttonText}</span> : null
                    }
                    <div className='relative flex justify-center items-center'>{buttonIconRight}</div>
                </div>
            </button>
        )
    }
}
