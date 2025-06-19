'use client'

import { Toaster } from 'sonner'
import DriverListFactory from '@/components/admin/drivers/driver-list-factory'

export default function DriversPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Toaster position="top-center" />
      
      {/* Driver List */}
      <DriverListFactory />
    </div>
  )
}