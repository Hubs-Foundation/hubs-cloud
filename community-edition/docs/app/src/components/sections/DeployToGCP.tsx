import React from 'react';
import Divider from '../Divider';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { HubsDivider } from '../HubsDivider';

export const DeployToGCP = ({ }) => {
    return (
        <div className='p-2 w-full max-w-4xl space-y-4'>
            <h2 id="deploying-hubs-to-gcp" className='text-3xl font-semibold'><a href="#deploying-hubs-to-gcp" className='hover:underline'>Deploying Hubs to Google Cloud</a></h2>
            <Divider className='!mt-1' />
            <p></p>

            <HubsDivider className='w-full max-w-6xl' />
        </div>
    )
}