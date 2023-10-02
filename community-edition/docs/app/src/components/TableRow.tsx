import React from "react"

export const TableRow = ({ col1, cols }) => {
    return (
        <tr className='border-b bg-slate-100 border-slate-300 odd:bg-slate-50 even:bg-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:odd:bg-slate-800 dark:even:bg-slate-700'>
            <td className="px-2 py-1 md:py-2 text-right">{col1}</td>
            {
                cols.map((col, idx) => {
                    return (
                        <td key={idx} className="px-2 py-1 md:py-2">{col}</td>
                    )
                })
            }
        </tr>
    )
}