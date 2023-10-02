import React from "react";
import { Footer } from "./Footer";

export const Layout = ({ children }) => {
    return (
        <>
            <div className='relative flex flex-col items-center min-h-screen w-full bg-slate-50 dark:bg-neutral-900 text-neutral-950 dark:text-slate-50 text-base md:text-lg transition-colors'>
                <main className="grow flex flex-col w-full items-center">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    )
}
