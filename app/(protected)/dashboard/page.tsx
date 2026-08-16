import { UserMenuWithSession } from '@/features/auth/components/user-menu'
import React from 'react'

const DashboardPage = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className='flex items-center gap-2'>
                <UserMenuWithSession variant='compact' />
                <div>DashboardPage</div>
            </div>
        </div>
    )
}

export default DashboardPage