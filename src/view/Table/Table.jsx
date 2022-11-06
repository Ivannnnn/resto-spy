import { useRef, useEffect } from 'react'
import { cx } from '@/helpers'

function debounce(fn, wait = 0) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.call(this, ...args), wait)
  }
}

const useResize = (cb, track, wait = 0) => {
  useEffect(() => {
    if (track) {
      if (wait) {
        cb = debounce(cb, wait)
      }
      window.addEventListener('resize', cb)
      return () => window.removeEventListener('resize', cb)
    }
  }, [track])
}

export default function Table({ data, headers, className }) {
  console.log(data)
  const container = useRef()

  const setTableHeight = () => {
    container.current.style.height =
      window.innerHeight -
      container.current.getBoundingClientRect().top +
      //48
      'px'
  }

  useEffect(setTableHeight, [])
  useResize(setTableHeight, true, 100)

  return (
    <div className="tableContainer" ref={container} style={{ height: 0 }}>
      <table
        className={cx(
          'table p-4 bg-white shadow rounded-lg text-left text-sm',
          className
        )}
      >
        <thead>
          <tr className="bg-gray-200 tracking-tighter">
            {headers.map((header, i) => (
              <th
                key={i}
                className="border p-2 dark:border-dark-5 whitespace-nowrap text-gray-900"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr {...row[0]} className="text-gray-700 text-md">
              {row.slice(1).map((column, i) =>
                typeof column === 'function' ? (
                  <td
                    key={i}
                    className="border px-3 py-2 dark:border-dark-5"
                    dangerouslySetInnerHTML={{ __html: column(row) }}
                  ></td>
                ) : (
                  <td key={i} className="border px-3 py-2 dark:border-dark-5">
                    {column}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
