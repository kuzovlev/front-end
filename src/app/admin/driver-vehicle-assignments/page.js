'use client'

import { Toaster } from 'sonner'
import DriverVehicleListFactory from '@/components/admin/driver-vehicle-assignments/driver-vehicle-list-factory'

export default function DriverVehicleAssignmentsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Toaster position="top-center" />
      
      {/* Driver Vehicle List */}
      <DriverVehicleListFactory />
    </div>
  )
} 