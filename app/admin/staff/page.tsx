'use client'

import React from 'react'
import StaffRegistrationForm from '../../../components/admin/StaffRegistrationForm'
import StaffManagementTable from '../../../components/admin/StaffManagementTable'

export default function AdminStaffPage() {
  return (
    <div className="space-y-6">
      <section>
        <div className="section-kicker">People operations</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#0B1F3A]">Staff management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Create accounts, assign passwords, disable access, and keep the operational directory clean.</p>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <StaffRegistrationForm />
        </div>
        <div className="xl:col-span-2">
          <StaffManagementTable />
        </div>
      </div>
    </div>
  )
}
