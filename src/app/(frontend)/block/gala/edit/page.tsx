'use client'
import { useState } from 'react'
import { FormInput, FormSelect, FormDisplay } from '../../components/FormSection'
import { GalaState } from '../../components/type'
import { handleInput } from '../../components/calculate'
import FetchVendorEdit from '../../components/FetchVendorEdit'
import Summary from '../../components/Summary'
import Group from '../../components/Group'
import { useRouter } from 'next/navigation'
import { Message } from '@/app/(frontend)/components/Message'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'


export default function EditTodiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [todi, setTodi] = useState<GalaState>({
    id: '',
    total_block_cost: '',
    total_block_area: '',
    total_gala_cost: '',
    total_gala_area: '',
    vender_id: '',
    munim: '',
    GalaType: '',
    date: new Date().toISOString(),
    l: '',
    front_b: '',
    back_b: '',
    total_b: '',
    h: '',
    gala_cost: '',
    hydra_cost: '',
    truck_cost: '',
    estimate_cost: '',
    depreciation: '',
    final_cost: '',
    todi_cost: (todi_cost: any) => {}, 
    group: [
      {
        g_hydra_cost: '',
        g_truck_cost: '',
        date: new Date().toISOString(),
        block: [],
        total_block_area: '',
        total_block_cost: ''
      }
    ]
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')



  useEffect(() => {
    const fetchTodi = async () => {
      const id = searchParams.get('id')
      if (!id) return

      try {
        const res = await axios.get<GalaState>(`/api/Gala/${id}`)
        setTodi(res.data)
      } catch (error) {
        setErrorMessage('Failed to fetch Todi data')
        setShowErrorMessage(true)
      }
    }

    fetchTodi()
  }, [searchParams])

  if (!todi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!todi || !todi.id) return

    try {
      setIsSubmitting(true)
      
      // Ensure all required fields are present
      if (!todi.GalaType || !todi.l || !todi.h || !todi.total_b) {
        throw new Error('Please fill in all required fields')
      }

      console.log('Attempting to update Gala with ID:', todi.id)
      console.log('Data to send:', todi)

      // Using the correct API path structure
      const response = await axios.patch(`/api/gala/${todi.id}`, todi)
      console.log('Response from server:', response.data)
      
      if (!response.data) {
        throw new Error('Failed to update Gala. No data returned from server')
      }

      setShowSuccessMessage(true)
    } catch (error: any) {
      console.error('Full error details:', error)
      console.error('Response status:', error.response?.status)
      console.error('Response data:', error.response?.data)
      
      setErrorMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        `Failed to update Gala. Status: ${error.response?.status || 'unknown'}`
      )
      setShowErrorMessage(true)
    } finally {
      setIsSubmitting(false)
    }
  }


  if (showErrorMessage) {
    return (
      <Message 
        setShowMessage={setShowErrorMessage} 
        type='error' 
        message={errorMessage}
      />
    )
  }

  if (showSuccessMessage) {
    return (
      <Message 
        setShowMessage={setShowSuccessMessage} 
        path={'/block/gala'} 
        type='success' 
        message='Gala has been updated successfully.'
      />
    )
  }


  

  return (
    <form onSubmit={handleSubmit} className=" max-w-7xl mx-auto p-6 py-4 space-y-6">
      <h1 className="text-xl font-bold">Edit Todi</h1>

      <div className="px-4 py-6 bg-gray-50 dark:bg-black rounded-lg shadow-md max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormSelect 
          label="Block Type:" 
          id="BlockType" 
          name="BlockType" 
          value={todi.GalaType} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)}
        >
          <option value="">Select Type</option>
          <option value="White">White</option>
          <option value="Brown">Brown</option>
        </FormSelect>
        <FetchVendorEdit 
          todi={todi}
          setTodi={setTodi} 
        />  
        <FormInput 
          label="Munim:" 
          id="munim" 
          name="munim" 
          value={todi.munim} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
        <FormInput 
          label="L (लम्बाई) - Length (m):" 
          id="l" 
          name="l" 
          value={todi.l} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
  <FormInput label="Front B (चौड़ाई) - Breadth (m):" id="front_b" name="front_b" value={todi.front_b} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = e.target;
  handleInput(e, setTodi);
  const frontB = parseFloat(value || '0');
  const backB = parseFloat(todi.back_b || '0');
  const totalB = (frontB + backB) / 2;
  setTodi(prev => ({ ...prev, front_b: value, total_b: totalB.toString() }));
}}
  />
  <FormInput label="Back B (चौड़ाई) - Breadth (m):" id="back_b" name="back_b" value={todi.back_b} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  const { value } = e.target;
  handleInput(e, setTodi);
  const frontB = parseFloat(todi.front_b || '0');
  const backB = parseFloat(value || '0');
  const totalB = (frontB + backB) / 2;
  setTodi(prev => ({ ...prev, back_b: value, total_b: totalB.toString() }));
}}
  />
  <FormInput label="Total B (चौड़ाई) - Breadth (m):" id="total_b" name="total_b" value={todi.total_b} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} disabled />

        <FormInput 
          label="H (ऊंचाई) - Height (m):" 
          id="h" 
          name="h" 
          value={todi.h} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
        <FormInput 
          label="Gala Cost (₹):" 
          id="gala_cost" 
          name="gala_cost" 
          value={todi.gala_cost ? Number(todi.gala_cost).toLocaleString('en-IN') : ''} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
        <FormInput 
          label="Hydra Cost (₹):" 
          id="hydra_cost" 
          name="hydra_cost" 
          value={todi.hydra_cost} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
        <FormInput 
          label="Truck Cost (₹):" 
          id="truck_cost" 
          name="truck_cost" 
          value={todi.truck_cost} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
        <FormDisplay label="Total Todi Area (m³):" value={todi.total_gala_area} />
        <FormDisplay label="Total Todi Cost (₹):" value={todi.total_gala_cost} />
        <FormDisplay label="Estimate Cost (₹):" value={todi.estimate_cost} />
        <FormInput 
          label="Depreciation (%):" 
          id="depreciation" 
          name="depreciation" 
          value={todi.depreciation} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setTodi)} 
        />
        <FormDisplay label="Final Cost (₹):" value={todi.final_cost} />
      </div>

      <Group todi={todi} setTodi={setTodi} />

      <Summary 
        title="Summary"
        totalBlockArea={todi.total_block_area}
        totalBlockCost={todi.total_block_cost}
        remainingAmount={(parseFloat(todi.final_cost || '0') - parseFloat(todi.total_block_cost)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      />

      <button 
        type="submit" 
        className="bg-green-600 text-white px-4 py-2 mt-6"
        disabled={isSubmitting || !todi}
      >
        {isSubmitting ? 'Updating...' : 'Update'}
      </button>
    </form>
  )
}