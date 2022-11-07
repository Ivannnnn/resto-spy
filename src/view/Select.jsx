export default function Select({ options, selected, onChange }) {
  return (
    <select
      className="form-select form-select-lg w-40 appearance-none px-4 py-2 text-md font-normal text-gray-700
              bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300
              rounded transition ease-in-out m-0 cursor-pointer
            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
      aria-label=".form-select-lg example"
      onChange={(e) => onChange(e.target.value)}
      value={selected}
    >
      {Object.keys(options).map((name) => (
        <option key={name} value={name}>
          {options[name]}
        </option>
      ))}
    </select>
  )
}
