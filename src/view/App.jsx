import { useEffect, useRef } from 'react'
import { restos } from '../fakeData'
import { ChevronIcon } from '@/view/Icon'
import Table from './Table/Table'

const plus = (num) => (num > 0 ? '+' + num : num)

function Select({ options }) {
  return (
    <select
      className="form-select form-select-lg w-40 appearance-none px-4 py-2 text-md font-normal text-gray-700
              bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300
              rounded transition ease-in-out m-0 cursor-pointer
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
      aria-label=".form-select-lg example"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function displayStatus({ before, after }) {
  return (
    {
      'true-false': 'left',
      'false-true': 'joined',
    }[`${!!before}-${!!after}`] || null
  )
}

function displayName({ before, after }) {
  return `${(after || before).name} ${(after || before).branch.replace(
    /Leipzig/g,
    ''
  )}`
}

function displayPopularity({ after, diff }) {
  if (!after) return null
  return `${after.popularity} (${plus(diff.popularity)})`
}

function displayScore({ after, diff }) {
  if (!after) return null
  return `${after.score} (${plus(diff.score)})`
}

function displayVotes({ after, diff }) {
  if (!after) return null
  return `${after.votes} (${plus(diff.votes)})`
}

export default function App() {
  const map = useRef()

  useEffect(() => {
    return

    if (!map.current) {
      map.current = L.map('map').setView([51.3388528, 12.3741965], 13)

      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
        map.current
      )
    }
  }, [])

  const sortBy = 'score'

  const data = restos
    //.sort((a, b) => (a[sortBy] < b[sortBy] ? 1 : -1))
    .map((resto) => {
      return [(resto.after || resto.before).id].concat(
        [
          displayName,
          displayStatus,
          displayPopularity,
          displayScore,
          displayVotes,
        ].map((f) => f(resto))
      )
    })

  return (
    <div className="h-full bg-gray-100 text-gray-800">
      <div id="map" className="h-52 bg-blue-100">
        map
      </div>

      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between py-2 px-16 my-2">
          <button className="py-3 px-3 hover:bg-gray-200">
            <ChevronIcon className="w-8 h-8" direction="180" />
          </button>

          <div className="text-center">
            <div className="text-xl">Week 42</div>
            <div className="text-gray-600 text-lg">19 Okt - 26 Okt</div>
          </div>

          <button className="py-3 px-3 hover:bg-gray-200">
            <ChevronIcon className="w-8 h-8" />
          </button>
        </div>

        <div className="mb-3 ml-2">
          <label className="inline-block mr-3 text-base font-medium text-gray-900 dark:text-gray-400">
            Sort by:
          </label>

          <Select
            options={[
              'Status',
              'Popularity',
              'Rating',
              'Votes',
              'Popularity Δ',
              'Rating Δ',
              'Votes Δ',
            ]}
          />

          <button className="px-2 py-2 m-0 bg-white align-bottom border border-solid border-gray-300 ml-1">
            <ChevronIcon className="w-4 h-4" direction="90" />
          </button>
        </div>
        <Table
          data={data}
          headers={['Name', 'Status', 'Popularity', 'Rating', 'Votes']}
          className="mx-auto"
        />
      </div>

      {/*
      <div className="items fixed bottom-0 flex w-full border bg-white text-center items-center">
        <button className="h-14 grow border border-r-gray border-r-gray-100 bg-gray-50 flex items-center justify-center">
          {'<-- Back'}
        </button>
      </div>
  */}
    </div>
  )
}

//
;(async function () {
  const restos = (
    await fetch(
      `https://ivansempire.com/api/restos/ondates/2022-10-17,2022-10-23`
    ).then((r) => r.json())
  ).map((resto) => {
    return { ...resto, date: resto.date.slice(0, 10) }
  })

  function toCSV(data) {
    return data
      .map((row) => {
        return '"' + row.join('","') + '"'
      })
      .join('\n')
  }

  const byIdAndDate = {}
  restos.forEach((resto) => {
    byIdAndDate[resto.id]
      ? byIdAndDate[resto.id].push(resto)
      : (byIdAndDate[resto.id] = [resto])
  })

  const diffs = Object.values(byIdAndDate).map(([before, after]) => {
    return {
      before,
      after,
      diff: !!before &&
        !!after && {
          votes: after.votes - before.votes,
          popularity: after.popularity - before.popularity,
          score: Number((after.score - before.score).toPrecision(2)),
        },
    }
  })

  const sortBy = 'score'

  const diffsTable = diffs
    .filter(Boolean)
    .sort((a, b) => (a[sortBy] < b[sortBy] ? 1 : -1))
    .map(({ after, popularity, votes, score }) => {
      return [
        `${after.name} ${after.branch}`,
        `${after.popularity}(${popularity})`,
        `${after.votes}(${votes})`,
        `${after.score}(${score})`,
      ]
    })

  //console.log(toCSV(diffsTable))

  //console.log('name | popularity | votes | score\n' + str)
})
