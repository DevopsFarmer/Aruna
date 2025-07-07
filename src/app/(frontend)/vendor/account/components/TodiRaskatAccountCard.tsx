'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Vendor, TodiRaskat } from '@/payload-types'
import { format, parse } from 'date-fns'

interface Props {
  initialTodiRaskats: TodiRaskat[]
  initialVendors: Vendor[]
  initialVendorId: string | null
}

export default function TodiRaskatAccountCard({ initialTodiRaskats, initialVendors, initialVendorId }: Props) {
  const [todis, setTodis] = useState(initialTodiRaskats)
  const [vendors, setVendors] = useState(initialVendors)
  const [selectedVendor, setSelectedVendor] = useState(initialVendorId)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
const searchParams = useSearchParams()

useEffect(() => {
  const vendorId = searchParams.get('vendor') ?? ''
  setSelectedVendor(vendorId)

  setIsLoading(true)
  setError(null)

  try {
    const filtered = vendorId
      ? initialTodiRaskats.filter((todi) => {
          const id = typeof todi.vender_id === 'object' ? todi.vender_id?.id : todi.vender_id
          return String(id) === vendorId
        })
      : initialTodiRaskats

    setTodis(filtered)
  } catch (err) {
    setError('Error filtering Todi Raskats')
    setTodis([])
  } finally {
    setIsLoading(false)
  }
}, [searchParams, initialTodiRaskats])

const handleVendorChange = (vendorId: string) => {
  router.push(`/vendor/account?vendor=${vendorId}`)
}

const handleDateChange = () => {
  setIsLoading(true)
  setError(null)

  try {
    // First filter by vendor if selected
    let filtered = selectedVendor
      ? initialTodiRaskats.filter((todi) => {
          const id = typeof todi.vender_id === 'object' ? todi.vender_id?.id : todi.vender_id
          return String(id) === selectedVendor
        })
      : initialTodiRaskats

    // Then filter by date range if dates are selected
    if (startDate || endDate) {
      filtered = filtered.filter((todi) => {
        if (!todi.date) return false
        const todiDate = new Date(todi.date)
        const start = startDate ? startDate : new Date(0)
        const end = endDate ? endDate : new Date()
        return todiDate >= start && todiDate <= end
      })
    }

    setTodis(filtered)
  } catch (err) {
    setError('Error filtering Todi Raskats')
    setTodis([])
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Todi Raskat List</h1>
        <div className="flex gap-4">
        <select
          value={selectedVendor || ''}
          onChange={(e) => handleVendorChange(e.target.value)}
          className="px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vendor}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
            <input
              type="date"
              value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : null
                
                // Reset end date if start date is after end date
                if (date && endDate && date > endDate) {
                  setEndDate(null)
                }
                
                setStartDate(date)
                handleDateChange()
              }}
              className="px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? parse(e.target.value, 'yyyy-MM-dd', new Date()) : null
                
                // Reset start date if end date is before start date
                if (date && startDate && date < startDate) {
                  setStartDate(null)
                }
                
                setEndDate(date)
                handleDateChange()
              }}
              className="px-3 py-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-left text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2">Vendor</th>
              <th className="px-4 py-2">Estimate</th>
              <th className="px-4 py-2">Final</th>
              <th className="px-4 py-2">Remaining</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center px-4 py-4 text-gray-500 dark:text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : todis?.length > 0 ? (
              todis.map((todi) => (
                <tr key={todi.id} className="border-t dark:border-gray-700">
                  <td className="px-4 py-2">
                    {typeof todi.vender_id === 'object' && todi.vender_id?.vendor
                      ? todi.vender_id.vendor
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2">₹{todi.estimate_cost?.toLocaleString('en-IN') || '0'}</td>
                  <td className="px-4 py-2">₹{todi.final_cost?.toLocaleString('en-IN') || '0'}</td>
                  <td className="px-4 py-2">₹{todi.partyRemainingPayment?.toLocaleString('en-IN') || '0'}</td>
                  <td className="px-4 py-2">
                    <Link href={`/vendor/account/todiRaskat/edit?id=${todi.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline" >  Edit  </Link>
                    <Link href={`/vendor/account/todiRaskat/view?id=${todi.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline" >  View  </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-4 py-4 text-gray-500 dark:text-gray-400">
                  No Todi Raskat records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
