import React from 'react';
import Divider from '../Divider';
import { AcademicCapIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { HubsDivider } from '../HubsDivider';

export const WhatIsCommunityEdition = ({ }) => {
    return (
        <div className='p-2 w-full max-w-4xl space-y-4'>
            <h2 id="what-is-hubs-ce" className='text-3xl font-semibold'><a href="#what-is-hubs-ce" className='hover:underline'>What is Hubs Community Edition?</a></h2>
            <Divider className='!mt-1' />
            <p>Prior to the release of Community Edition, people who wanted to create their own Hub could either:</p>
            <ol className='list-decimal ml-5 !mt-1'>
                <li>Use <a className='underline text-blue-900 dark:text-blue-100' target="_blank" href='https://hubs.mozilla.com/labs/free-managed-hubs-with-the-starter-plan/'>Hubs Starter<ArrowTopRightOnSquareIcon className='h-4 w-4 ml-1 -top-0.5 relative inline-block' /></a> for free</li>
                <li>Subscribe to a <a className='underline text-blue-900 dark:text-blue-100' target="_blank" href='https://hubs.mozilla.com/#subscribe'>paid Hubs plan<ArrowTopRightOnSquareIcon className='h-4 w-4 ml-1 -top-0.5 relative inline-block' /></a> for greater capacity and asset storage</li>
                <li>⭐ Deploy <a className='underline text-blue-900 dark:text-blue-100' target="_blank" href='https://hubs.mozilla.com/cloud'>Hubs Cloud<ArrowTopRightOnSquareIcon className='h-4 w-4 ml-1 -top-0.5 relative inline-block' /></a> on Amazon's AWS infrastructure</li>
            </ol>

            <p>⭐ The goal with Hubs Cloud was to allow organizations to deploy Hubs on infrastructure that they controlled (as much as one can control infrastructure hosted by Amazon), rather than paying Mozilla to maintain that infrastructure on their behalf. However, since launching Hubs Cloud:</p>
            <ul className='list-disc ml-5 !mt-1'>
                <li>The Hubs team made several changes to the Hubs codebase that didn't propagate to Hubs Cloud instances, either due to lack of resources or because customers couldn't easily integrate those changes</li>
                <li>It cost the Hubs team and Hubs Cloud customers significant resources to keep up with Amazon's platform updates</li>
                <li>The Hubs team understood that many organizations need to deploy Hubs on cloud computing platforms that aren't Amazon's</li>
            </ul>

            <p>To resolve these issues and more, the Hubs team sunset Hubs Cloud and launched <span className='font-semibold'>Hubs Community Edition</span>.</p>
            <p>With <span className='font-semibold'>Hubs Community Edition</span>, anyone can deploy the <i className='font-semibold'>full Hubs stack</i> on <i className='font-semibold'>any</i> Linux-based infrastrucure, including AWS, Google Cloud, and even your own Linux computer.</p>

            <p>Continue reading to learn how to deploy Hubs Community Edition. You can also <a className="underline text-blue-900 dark:text-blue-100" href="#hubs-ce-infrastructure">skip ahead to learn more about the infrastructure of the Hubs CE software stack.</a></p>

            <HubsDivider className='w-full max-w-6xl' />
        </div>
    )
}