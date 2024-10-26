'use client'

import { useState, useEffect, FormEvent } from 'react'

interface Item {
  id: string
  name: string
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch items from the API on initial load
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8000/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      } else {
        console.error('Failed to fetch items')
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const addItem = async (e: FormEvent) => {
    e.preventDefault()
    if (!name) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      if (response.ok) {
        const data = await response.json()
        setItems((prev) => [...prev, { id: data.item_id, name }])
        setName('')
      } else {
        console.error('Failed to add item')
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100 text-black">
      <h1 className="text-3xl font-bold text-center mb-8 ">FastAPI + MongoDB + Next.js</h1>

      <form onSubmit={addItem} className="flex items-center space-x-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Items:</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="px-4 py-2 bg-white rounded-lg shadow">
              {item.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

