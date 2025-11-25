import React from 'react'

export default function ToggleSwitch({ checked = false, onChange, ariaLabel }) {
  return (
    <label className="inline-flex items-center cursor-pointer" aria-label={ariaLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange && onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={`relative inline-block w-11 h-6 transition-colors duration-200 rounded-full ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
    </label>
  )
}
