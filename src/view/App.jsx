import { useEffect, useRef } from 'react'
import { ChevronIcon } from '@/view/Icon'
import Table from './Table/Table'
import Select from './Select'
import { useUpdateState } from '@/helpers'

const displayDiff = (resto, prop) => {
  const diff = resto[prop + 'Diff']

  return typeof resto[prop + 'Diff'] !== 'undefined'
    ? ` <span class="${
        diff < 0 ? 'text-red-500' : diff === 0 ? '' : 'text-green-500'
      }">${diff < 0 ? `(${diff})` : diff === 0 ? '' : `(+${diff})`}</span>`
    : ''
}

const getRestos = async (from, to) => {
  const restos = (
    await fetch(
      `https://ivansempire.com/api/restos/ondates/${from},${to}`
    ).then((r) => r.json())
  ).map((resto) => {
    return { ...resto, date: resto.date.slice(0, 10) }
  })

  const byIdAndDate = {}
  restos.forEach((resto) => {
    if (!byIdAndDate[resto.id]) byIdAndDate[resto.id] = []
    byIdAndDate[resto.id][Number(resto.date === to)] = resto
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

  return diffs
}

export default function App() {
  const map = useRef()
  const [sort, updateSort] = useUpdateState({ by: 'status', order: 1 })
  const [data, updateData] = useUpdateState({ loading: true })

  useEffect(() => {
    return

    if (!map.current) {
      map.current = L.map('map').setView([51.3388528, 12.3741965], 13)

      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
        map.current
      )
    }
  }, [])

  useEffect(() => {
    updateData(getRestos('2022-11-01', '2022-11-07'))
  }, [])

  if (data.loading) return <h1 className="3xl">Loading...</h1>

  const preparedData = data
    .map(({ before, after, diff }) => {
      return {
        id: (after || before).id,
        name: (
          (after || before).name +
          ' ' +
          (after || before).branch.replace(/Leipzig/g, '')
        ).trim(),
        status:
          {
            'true-false': 'left',
            'false-true': 'joined',
          }[`${!!before}-${!!after}`] || '',
        popularity: (after || before).popularity,
        popularityDiff: diff?.popularity,
        rating: (after || before).score,
        ratingDiff: diff?.score,
        votes: (after || before).votes,
        votesDiff: diff?.votes,
      }
    })
    .sort(
      (a, b) =>
        (a[sort.by] === undefined) - (b[sort.by] === undefined) || // undefined always at bottom
        -1 * sort.order * (a[sort.by] > b[sort.by]) ||
        sort.order * (a[sort.by] < b[sort.by])
    )
    .map((resto) => {
      return [
        { key: resto.id, status: resto.status || null },
        resto.name,
        () => resto.popularity + displayDiff(resto, 'popularity'),
        () => resto.rating + displayDiff(resto, 'rating'),
        () => resto.votes + displayDiff(resto, 'votes'),
      ]
    })

  return (
    <div className="h-full bg-gray-100 text-gray-800">
      <div id="map" className="h-52 bg-blue-100"></div>

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

        <div className="mb-3 ml-2 flex items-center">
          <label className="inline-block mr-3 text-base font-medium text-gray-900 dark:text-gray-400">
            Sort by:
          </label>

          <Select
            options={{
              status: 'Status',
              popularity: 'Popularity',
              rating: 'Rating',
              votes: 'Votes',
              popularityDiff: 'Popularity Δ',
              ratingDiff: 'Rating Δ',
              votesDiff: 'Votes Δ',
            }}
            selected={sort.by}
            onChange={(by) => updateSort({ by })}
          />

          <button
            className="px-2 py-2 m-0 bg-white align-bottom border border-solid border-gray-300 ml-1"
            onClick={() =>
              updateSort({
                order: sort.order === 1 ? -1 : 1,
              })
            }
          >
            <ChevronIcon className="w-4 h-4" direction={sort.order * 90} />
          </button>

          <p className="text-right grow mr-4 font-bold text-lg">
            {preparedData.length}{' '}
            <span className="font-normal text-base">restaurants</span>
          </p>
        </div>

        <Table
          data={preparedData}
          headers={['Name', 'Popularity', 'Rating', 'Votes']}
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
