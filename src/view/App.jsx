import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return <h2 className="text-red-500">hello world</h2>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
