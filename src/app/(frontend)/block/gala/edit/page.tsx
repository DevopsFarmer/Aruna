'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { ApiResponse } from '../../types'
import Link from 'next/link'



import { useRouter, useSearchParams } from 'next/navigation'

interface Measure {
  l: string
  b: string
  h: string
  block_area: string
  block_cost: string
  id?: string | number
}

interface Block {
  addmeasures: Measure[]
  block_cost: string
}

interface Group {
  g_hydra_cost: string;
  g_truck_cost: string;
  date: string;
  block: Block[];
  [key: string]: string | Block[];
}

// Define valid field names for each level
type GroupField = keyof Group

type Vendor = {
  id: number
  vendor: string
  vendor_no: string
  address: string
}

type BlockType = {
  total_cost: any
  GalaType: string
  block: any
  vender_id: number
  total_area: number
  munim: string
  todirate: string
  total_gala_area: string
  estimate_cost: string
  depreciation: string
  final_cost: string
  l: string
  front_b: string
  back_b: string
  total_b: string
  h: string
  gala_cost: string
  hydra_cost: string
  truck_cost: string
  total_gala_cost: string
  id: number | string
  BlockType: string
  date: string
  mines: number
  labour_name: string
  addmeasures: Measure[]
  total_quantity: number | null
  issued_quantity: number | null
  left_quantity: number | null
  final_total: number
  partyRemainingPayment: number
  partyAdvancePayment: number | null
  transportType: string | null
  createdBy: { name: string } | null
  createdAt: string
  updatedAt: string
  vehicle_cost: number | null
  vehicle_number: string | null
  group: Group[]
}


export default function EditBlock() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentBlock, setCurrentBlock] = useState<BlockType | null>(null)
  const [newBlock, setNewBlock] = useState<BlockType | null>(null)

  useEffect(() => {
    if (newBlock) {
      const frontBreadth = parseFloat(newBlock.front_b || '0');
      const backBreadth = parseFloat(newBlock.back_b || '0');
      const totalBreadth = (frontBreadth + backBreadth) / 2;
      if (totalBreadth !== parseFloat(newBlock.total_b || '0')) {
        setNewBlock(prev =>
          prev
            ? {
                ...prev,
                total_b: totalBreadth.toFixed(2),
              }
            : prev,
        );
      }
    }
  }, [newBlock?.front_b, newBlock?.back_b]);

  useEffect(() => {
    if (newBlock) {
      const length = parseFloat(newBlock.l || '0');
      const totalBreadth = parseFloat(newBlock.total_b || '0');
      const height = parseFloat(newBlock.h || '0');
      const area = length * totalBreadth * height;
      if (area !== parseFloat(newBlock.total_gala_area || '0')) {
        setNewBlock(prev =>
          prev
            ? {
                ...prev,
                total_gala_area: area.toFixed(2),
              }
            : prev,
        );
      }
    }
  }, [newBlock?.l, newBlock?.total_b, newBlock?.h]);

  useEffect(() => {
    if (newBlock) {
      const totalGalaCost = parseFloat(newBlock.total_gala_cost || '0');
      const totalGalaArea = parseFloat(newBlock.total_gala_area || '0');
      const estimateCost = totalGalaCost * totalGalaArea;
      if (estimateCost !== parseFloat(newBlock.estimate_cost || '0')) {
        setNewBlock(prev =>
          prev
            ? {
                ...prev,
                estimate_cost: estimateCost.toFixed(2),
              }
            : prev,
        );
      }
    }
  }, [newBlock?.total_gala_cost, newBlock?.total_gala_area]);

  useEffect(() => {
    if (newBlock) {
      const galaCost = parseFloat(newBlock.gala_cost || '0');
      const hydraCost = parseFloat(newBlock.hydra_cost || '0');
      const truckCost = parseFloat(newBlock.truck_cost || '0');
      const totalGalaCost = galaCost + hydraCost + truckCost;
      if (totalGalaCost !== parseFloat(newBlock.total_gala_cost || '0')) {
        setNewBlock(prev =>
          prev
            ? {
                ...prev,
                total_gala_cost: totalGalaCost.toFixed(2),
              }
            : prev,
        );
      }
    }
  }, [newBlock?.gala_cost, newBlock?.hydra_cost, newBlock?.truck_cost]);


  useEffect(() => {
    if (newBlock) {
      const estimateCost = parseFloat(newBlock.estimate_cost || '0');
      const depreciation = parseFloat(newBlock.depreciation || '0');
      const finalCost = estimateCost - ((depreciation / 100) * estimateCost);
      if (finalCost !== parseFloat(newBlock.final_cost || '0')) {
        setNewBlock(prev =>
          prev
            ? {
                ...prev,
                final_cost: finalCost.toFixed(2),
              }
            : prev,
        );
      }
    }
  }, [newBlock?.estimate_cost, newBlock?.depreciation]);





  const [, setShowSuccessModal] = useState(false)
  const [, setMunims] = useState<string[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  // Update currentBlock when newBlock changes
  useEffect(() => {
    if (newBlock) {
      setCurrentBlock(newBlock)
    }
  }, [newBlock])

  const id = searchParams.get('id') ?? null
  const [, setIsSubmitting] = useState(false)

  // Fetch munims
  useEffect(() => {
    const fetchMunims = async () => {
      try {
        const response = await axios.get<string[]>('/api/munims')
        setMunims(response.data)
      } catch (error) {
        console.error('Error fetching munims:', error)
      }
    }
    fetchMunims()
  }, [])


  
  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return

      try {
        // Fetch block data
        const blockRes = await axios.get<BlockType>(`/api/Gala/${id}`)
        const blockData = blockRes.data

        // Fetch vendors
        const vendorsRes = await axios.get<ApiResponse<Vendor>>('/api/vendor')
        const vendorsData = vendorsRes.data.docs
        setVendors(vendorsData)
        // Ensure measurements array exists
        if (!blockData.addmeasures) {
          blockData.addmeasures = []
        }

        // Set block data and vendor selection
        setCurrentBlock(blockData)
        setNewBlock(blockData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        setLoadingData(false)
      }
    }

    fetchAllData()
  }, [id])

  // Handle nested changes in groups, blocks, and measures
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, gIdx: number, bIdx?: number, mIdx?: number) => {
    if (!newBlock) return

    const updatedBlock = { ...newBlock }
    const fieldName = e.target.name;
    
    // Update group level fields
    if (bIdx === undefined) {
      // Update group level fields
      if (fieldName in updatedBlock.group[gIdx]) {
        updatedBlock.group[gIdx][fieldName] = e.target.value;
      }
    }
    // Update block level fields
    else if (mIdx === undefined) {
      // Get the current block object
      const currentBlock = updatedBlock.group[gIdx].block[bIdx];
      // Update group level fields
      if (fieldName in updatedBlock.group[gIdx]) {
        updatedBlock.group[gIdx] = {
          ...updatedBlock.group[gIdx],
          [fieldName]: e.target.value
        };
      }
    }
    // Update block level fields
    else if (field in updatedBlock.group[gIdx].block[bIdx]) {
      updatedBlock.group[gIdx].block[bIdx] = {
        ...updatedBlock.group[gIdx].block[bIdx],
        [field]: e.target.value
      };
    }
    // Update measure level fields
    else if (bIdx !== undefined && mIdx !== undefined) {
      updatedBlock.group[gIdx].block[bIdx].addmeasures[mIdx] = {
        ...updatedBlock.group[gIdx].block[bIdx].addmeasures[mIdx],
        [field]: e.target.value
      };
    }

    setNewBlock(updatedBlock)
  }

  // Add group
  const addGroup = () => {
    if (!newBlock) return

    const updatedBlock = { ...newBlock }
    updatedBlock.group.push({
      g_hydra_cost: '',
      g_truck_cost: '',
      date: new Date().toISOString().split('T')[0],
      block: []
    })

    setNewBlock(updatedBlock)
  }

  // Add block
  const addBlock = (gIdx: number) => {
    if (!newBlock) return

    const updatedBlock = { ...newBlock }
    updatedBlock.group[gIdx].block.push({
      addmeasures: [],
      block_cost: ''
    })

    setNewBlock(updatedBlock)
  }

  // Add measure
  const addMeasure = (gIdx: number, bIdx: number) => {
    if (!newBlock) return

    const updatedBlock = { ...newBlock }
    updatedBlock.group[gIdx].block[bIdx].addmeasures.push({
      l: '',
      b: '',
      h: '',
      block_area: '',
      block_cost: ''
    })

    setNewBlock(updatedBlock)
  }

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     if (!newBlock || !id) return
 
 
     try {
       setIsSubmitting(true)
       await axios.patch(`/api/Gala/${id}`, newBlock)
       setShowSuccessModal(true)
       router.push('/block/gala')
     } catch (error) {
       console.error('Error updating block:', error)
     } finally {
       setIsSubmitting(false)
     }
   }


   if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-gray-50 dark:bg-black pt-24">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit block</h1>
          <Link href="/block/todi(raskat)" className="text-gray-600 hover:text-gray-800">
            ← Back to block List
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 -2xl p-8 shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              GalaType
              </label>
              <select
               value={newBlock?.GalaType || ''}
               onChange={(e) =>
                 setNewBlock((prev: BlockType | null) =>
                   prev
                     ? {
                         ...prev,
                         GalaType: e.target.value,
                       }
                     : prev,
                 )
               }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Brown">Brown</option>
                <option value="White">White</option>
              </select>
            </div>



            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Vendor Name
              </label>
              <select
                value={newBlock?.vender_id?.toString() || ''}
                onChange={(e) => {
                  const selectedId = Number(e.target.value)
                  const selectedVendor = vendors.find((v) => v.id === selectedId)
                  if (selectedVendor) {
                    setNewBlock((prev: BlockType | null) =>
                      prev
                        ? {
                            ...prev,
                            vender_id: selectedId,
                            vendor_no: selectedVendor.vendor_no,
                          }
                        : prev,
                    )
                  } else {
                    setNewBlock((prev: BlockType | null) =>
                      prev
                        ? {
                            ...prev,
                            vender_id: selectedId,
                          }
                        : prev,
                    )
                  }
                }}
                disabled={loadingData}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.vendor}
                  </option>
                ))}
              </select>
            </div>




            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Munim
              </label>
              <input
                type="text"
                value={newBlock?.munim || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          munim: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Length (लम्बाई) (m)
              </label>
              <input
                type="text"
                value={newBlock?.l || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          l: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Front Breadth (चौड़ाई) (m)
              </label>
              <input
                type="text"
                value={newBlock?.front_b || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          front_b: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Back Breadth (चौड़ाई) (m)
              </label>
              <input
                type="text"
                value={newBlock?.back_b || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          back_b: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Total Breadth (चौड़ाई) (m)
              </label>
              <input
                type="text"
                value={newBlock?.total_b || ''}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Height (ऊंचाई) (m)
              </label>
              <input
                type="text"
                value={newBlock?.h || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          h: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Gala Cost (₹)
              </label>
              <input
                type="text"
                value={newBlock?.gala_cost || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          gala_cost: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Hydra Cost (₹)
              </label>
              <input
                type="text"
                value={newBlock?.hydra_cost || ''}
                onChange={(e) =>
                  setNewBlock((prev: BlockType | null) =>
                    prev
                      ? {
                          ...prev,
                          hydra_cost: e.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Truck Cost (₹)
                  </label>
                  <input
                    type="text"
                    value={newBlock?.truck_cost || ''}
                    onChange={(e) =>
                      setNewBlock((prev: BlockType | null) =>
                        prev
                          ? {
                              ...prev,
                              truck_cost: e.target.value,
                            }
                          : prev,
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Total Gala Area (m³)
                  </label>
                  <input
                    type="text"
                    value={Number(newBlock?.total_gala_area)?.toLocaleString('en-IN') || ''}
                    onChange={(e) => {
                      const length = parseFloat(newBlock?.l || '0');
                      const totalBreadth = parseFloat(newBlock?.total_b || '0');
                      const height = parseFloat(newBlock?.h || '0');
                      const area = length * totalBreadth * height;
                      setNewBlock((prev: BlockType | null) =>
                        prev
                          ? {
                              ...prev,
                              total_gala_area: area.toFixed(2),
                            }
                          : prev,
                      );
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    readOnly
                  />
                </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Total Gala Cost (₹)
                      </label>
                      <input
                        type="text"
                        value={Number(newBlock?.total_gala_cost)?.toLocaleString('en-IN') || ''}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Estimate Cost (₹)
                      </label>
                      <input
                        type="text"
                        value={Number(newBlock?.estimate_cost)?.toLocaleString('en-IN') || ''}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Depreciation (%)
                      </label>
                      <input
                        type="text"
                        value={newBlock?.depreciation || ''}
                        onChange={(e) =>
                          setNewBlock((prev: BlockType | null) =>
                            prev
                              ? {
                                  ...prev,
                                  depreciation: e.target.value,
                                }
                              : prev,
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Final Cost (₹)
                      </label>
                      <input
                        type="text"
                        value={Number(newBlock?.final_cost)?.toLocaleString('en-IN') || ''}
                        onChange={(e) =>
                          setNewBlock((prev: BlockType | null) =>
                            prev
                              ? {
                                  ...prev,
                                  final_cost: e.target.value,
                                }
                              : prev,
                          )
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 -lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    </div>

   {/* Groups */}
   <div className="space-y-4">
        <h2 className="text-lg font-semibold">Groups</h2>
        {currentBlock?.group?.map((group, gIdx) => (
          <div key={gIdx} className="border p-4  space-y-2">

            <div className="space-y-2">
              <label htmlFor="g_hydra_cost" className="block font-medium capitalize">Hydra Cost:</label>
              <input
                type="text"
                id="g_hydra_cost"
                name="g_hydra_cost"
                value={group.g_hydra_cost}
                onChange={(e) => {
                  handleNestedChange(e, 'g_hydra_cost', gIdx, undefined, undefined);
                  // Calculate block cost when hydra cost changes
                  const blockArea = parseFloat(group.block[0]?.addmeasures[0]?.block_area) || 0;
                  const truckCost = parseFloat(group.g_truck_cost) || 0;
                  const hydraCost = parseFloat(e.target.value) || 0;
                  const todiCost = parseFloat(newBlock?.gala_cost || '0') || 0;
                  const blockCost = (truckCost + hydraCost + todiCost) * blockArea;
                  handleNestedChange({ target: { name: 'block_cost', value: blockCost.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>, 'block_cost', gIdx, 0, 0);
                }}
                className="w-full border dark:bg-gray-600 p-2 "
              />

              <div className="space-y-2">
                <label htmlFor="date" className="block font-medium capitalize">Date:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={group.date}
                  onChange={(e) => handleNestedChange(e, 'date', gIdx)}
                  className="w-full border dark:bg-gray-600 p-2 "
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="g_truck_cost" className="block font-medium capitalize">Truck Cost (₹):</label>
              <input
                type="text"
                id="g_truck_cost"
                name="g_truck_cost"
                value={group.g_truck_cost}
                onChange={(e) => {
                  handleNestedChange(e, 'g_truck_cost', gIdx, undefined, undefined);
                  // Calculate block cost when truck cost changes
                  const blockArea = parseFloat(group.block[0]?.addmeasures[0]?.block_area) || 0;
                  const truckCost = parseFloat(e.target.value) || 0;
                  const hydraCost = parseFloat(group.g_hydra_cost) || 0;
                  const todiCost = parseFloat(newBlock?.gala_cost || '0') || 0;
                  const blockCost = (truckCost + hydraCost + todiCost) * blockArea;
                  handleNestedChange({ target: { name: 'block_cost', value: blockCost.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>, 'block_cost', gIdx, 0, 0);
                }}
                className="w-full border dark:bg-gray-600 p-2 "
              />
            </div>



            <button type="button" onClick={() => addBlock(gIdx)} className="text-sm text-blue-600">+ Add Block</button>

            {/* Blocks */}
            {group.block.map((block, bIdx) => (
              <div key={bIdx} className="ml-4 mt-2 border p-3 ">
              
             

                <button type="button" onClick={() => addMeasure(gIdx, bIdx)} className="text-sm text-green-600 mt-2">
                  + Add Measure
                </button>

                {/* Add Measures */}
                {block.addmeasures.map((m, mIdx) => (
                  <div key={mIdx} className="ml-4 mt-2 border p-2  bg-gray-50">
                    <div className="space-y-2">
                      <label htmlFor="l" className="block font-medium capitalize">L (लम्बाई) - Length (m):</label>
                      <input
                        type="text"
                        id="length"
                        name="l"
                        value={m.l}
                        onChange={(e) => {
                          handleNestedChange(e, 'l', gIdx, bIdx, mIdx);
                          // Calculate block area when length changes
                          const l = parseFloat(e.target.value) || 0;
                          const b = parseFloat(m.b) || 0;
                          const h = parseFloat(m.h) || 0;
                          const blockArea = l * b * h;
                          handleNestedChange({ target: { name: 'block_area', value: blockArea.toString() } } as React.ChangeEvent<HTMLInputElement>, 'block_area', gIdx, bIdx, mIdx);
                        }}
                        className="w-full border dark:bg-gray-600 p-2 "
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="b" className="block font-medium capitalize">B (चौड़ाई) - Breadth (m):</label>
                      <input
                        type="text"
                        id="breadth"
                        name="b"
                        value={m.b}
                        onChange={(e) => {
                          handleNestedChange(e, 'b', gIdx, bIdx, mIdx);
                          // Calculate block area when breadth changes
                          const l = parseFloat(m.l) || 0;
                          const b = parseFloat(e.target.value) || 0;
                          const h = parseFloat(m.h) || 0;
                          const blockArea = l * b * h;
                          handleNestedChange({ target: { name: 'block_area', value: blockArea.toString() } } as React.ChangeEvent<HTMLInputElement>, 'block_area', gIdx, bIdx, mIdx);
                        }}
                        className="w-full border dark:bg-gray-600 p-2 "
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="h" className="block font-medium capitalize">H (ऊंचाई) - Height (m):</label>
                      <input
                        type="text"
                        id="height"
                        name="h"
                        value={m.h}
                        onChange={(e) => {
                          handleNestedChange(e, 'h', gIdx, bIdx, mIdx);
                          // Calculate block area when height changes
                          const l = parseFloat(m.l) || 0;
                          const b = parseFloat(m.b) || 0;
                          const h = parseFloat(e.target.value) || 0;
                          const blockArea = l * b * h;
                          handleNestedChange({ target: { name: 'block_area', value: blockArea.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>, 'block_area', gIdx, bIdx, mIdx);
                        }}
                        className="w-full border dark:bg-gray-600 p-2 "
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="block_area" className="block font-medium capitalize">Block Area (m<sup>3</sup>):</label>
                      <input
                        type="text"
                        id="blockArea"
                        name="block_area"
                        value={Number(m.block_area)?.toLocaleString('en-IN') || ''}
                        onChange={(e) => {
                          handleNestedChange(e, 'block_area', gIdx, bIdx, mIdx);
                          // Calculate block cost when block area changes
                          const blockArea = parseFloat(e.target.value) || 0;
                          const truckCost = parseFloat(group.g_truck_cost) || 0;
                          const hydraCost = parseFloat(group.g_hydra_cost) || 0;
                          const todiCost = parseFloat(newBlock?.gala_cost || '0') || 0;
                          const blockCost = (truckCost + hydraCost + todiCost) * blockArea;
                          handleNestedChange({ target: { name: 'block_cost', value: blockCost.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>, 'block_cost', gIdx, bIdx, mIdx);
                          handleNestedChange({ target: { name: 'block_cost', value: blockCost.toFixed(2) } } as React.ChangeEvent<HTMLInputElement>, 'block_cost', gIdx, bIdx, mIdx);
                        }}
                        className="w-full border dark:bg-gray-600 p-2 "
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="block_cost" className="block font-medium capitalize">Block Cost (₹):</label>
                      <input
                        type="text"
                        id="block_cost"
                        name="block_cost"
                        value={Number(m.block_cost)?.toLocaleString('en-IN') || ''}
                        className="w-full border dark:bg-gray-600 p-2 "
                        disabled
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}

        <button type="button" onClick={addGroup} className="bg-blue-500 text-white px-3 py-2 ">
          + Add Group
        </button>
      </div>

          <div className="mt-8">
        <button
          type="submit"
          className="bg-indigo-600 dark:bg-indigo-500 text-white px-6 py-2 -lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          disabled={!newBlock}
        >
          Save Changes
        </button>
      </div>
        </form>
     
      </div>
    
    </div>
  )
}