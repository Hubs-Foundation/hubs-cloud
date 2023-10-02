import React from 'react';
import { useHeadings } from '../hooks/useHeadings';
import { linearScale } from '../lib/utilities';

export const TableOfContents = ({ className }: { className?: string }) => {
    const headings = useHeadings();
    
    return (
        <nav className={className}>
            <ul>
                {headings.map(heading => (
                    <li key={heading.id} style={{lineHeight: `${linearScale(heading.level, 2, 6, 2, 1)}rem`, marginLeft: `${(heading.level - 2) * 1.25}em`, fontSize: `${linearScale(heading.level, 2, 6, 1.25, 0.75)}rem` }}>
                        <a className='hover:underline' href={`#${heading.id}`} > {heading.text} </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
