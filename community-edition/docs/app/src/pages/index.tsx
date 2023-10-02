import React, { useState } from 'react';
import { Layout } from "../components/Layout";
import { SEO } from '../components/SEO';
import { useEventListenerWindow } from '../hooks/useEventListener';
import { ThemeToggleSwitch, isDarkThemeEnabled } from '../components/ToggleThemeSwitch';
import { Menu, Transition } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, ExclamationCircleIcon, BookmarkIcon as SolidBookmarkIcon } from '@heroicons/react/24/solid';
import { BookmarkIcon as OutlineBookmarkIcon } from '@heroicons/react/24/outline';
import Divider from '../components/Divider';
import { TableOfContents } from '../components/TableOfContents';
import { StaticImage } from "gatsby-plugin-image";
import { Introduction } from '../components/sections/Introduction';
import { WhatIsCommunityEdition } from '../components/sections/WhatIsCommunityEdition';
import { DeployToGCP } from '../components/sections/DeployToGCP';
import { DeployToCustom } from '../components/sections/DeployToCustom';
import { HubsCEComponents } from '../components/sections/HubsCEComponents';

const PageNavigationMenu = () => {
    return (
        <div className='flex fixed z-40 top-3 right-0 bottom-3 flex-col items-end transition-colors'>
            <Menu>
                {({ open }) => (
                    <>
                        <div className={`fixed inset-0 pointer-events-none transition-colors ${open ? 'bg-neutral-800/40' : 'transparent'}`} />
                        <Menu.Button tabIndex={0} className={`p-2 w-12 h-12 z-20 bg-slate-200/95 dark:bg-neutral-700/95 text-neutral-600 dark:text-slate-50 ${open ? 'rounded-tl-md' : 'rounded-l-md'} group`}>
                            {open ?
                                <SolidBookmarkIcon className='group-active:scale-100 group-hover:scale-110' /> :
                                <OutlineBookmarkIcon className='group-active:scale-100 group-hover:scale-110' />}
                        </Menu.Button>
                        <Transition
                            className='overflow-y-auto max-w-sm md:max-w-md bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 border-solid border-2 border-r-0 shadow-lg p-2 md:p-3 rounded-l-md'
                            enter="transition duration-250 ease-out"
                            enterFrom="transform translate-x-full opacity-0"
                            enterTo="transform translate-x-0 opacity-100"
                            leave="transition duration-200 ease-out"
                            leaveFrom="transform translate-x-0 opacity-100"
                            leaveTo="transform translate-x-full opacity-0"
                        >
                            <Menu.Items>
                                <Menu.Item>
                                    <>
                                        <div className='flex justify-between items-center gap-4'>
                                            <h2 className='font-semibold text-2xl'>Navigation</h2>
                                            <ThemeToggleSwitch />
                                        </div>
                                        <Divider className='mb-2' />
                                        <TableOfContents className='w-full' />
                                    </>
                                </Menu.Item>
                            </Menu.Items>
                        </Transition>
                    </>
                )}
            </Menu>
        </div>
    )
}

const IndexPage = ({ }) => {
    const [darkThemeEnabled, setDarkThemeEnabled] = useState(isDarkThemeEnabled());

    useEventListenerWindow("darkThemeChanged", (evt) => {
        setDarkThemeEnabled(evt.detail);
    });

    return (
        <Layout>
            <SEO />
            <div className='mb-4 md:mb-8 w-full flex flex-col items-center'>
                <header className='text-white pt-16 pb-8 md:py-8 px-2 w-full animate-gradient flex flex-col items-center relative' style={{ "background": "linear-gradient(107.97deg,#489cbe 6.73%,#5427c9 39.4%,#a8527c 77.18%,#a67878 104.75%)", "backgroundSize": "250% 250%" }}>
                    <StaticImage placeholder='none' objectFit='contain' className="max-w-md mt-4 mb-2" src="../images/header-transparent.png" alt="Hubs Community Edition" quality={100} />
                    <h3 className='text-xl underline'>Introductory Documentation</h3>
                    <h4 className='text-sm mb-4'>Updated October 2023</h4>
                    <ThemeToggleSwitch className='text-slate-50' isLarge={true} />
                </header>
            </div>

            <PageNavigationMenu />

            <div className='w-full flex flex-col items-center mb-16 md:mb-48 space-y-16 md:space-y-24'>
                <div className='space-y-16 md:space-y-24 w-full flex flex-col items-center'>
                    <Introduction />
                </div>

                <div className='!mt-4 w-full flex justify-center bg-slate-200/60 dark:bg-neutral-800 border-y-2 border-slate-300/40 dark:border-neutral-700'>
                    <div className='w-full max-w-4xl py-4 px-2 md:px-4'>
                        <h2 id="navigation" className='text-3xl font-semibold hover:underline'><a href="#navigation">Navigation</a></h2>
                        <Divider className='!mt-1' />
                        <TableOfContents />
                    </div>
                </div>

                <div className='!mt-8 space-y-16 md:space-y-24 w-full flex flex-col items-center'>
                    <WhatIsCommunityEdition />

                    <DeployToCustom />

                    <DeployToGCP />

                    <HubsCEComponents />
                </div>
            </div>
        </Layout>
    )
}

export default IndexPage;

