import { Button } from '@/components/ui/button'
import Logout from '@/modules/auth/components/logout';
import { requireAuth } from '@/modules/auth/utils/auth-utils'
import React from 'react'

const page = async () => {
  await requireAuth();
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <Logout>
        <Button>
          Logout
        </Button>
      </Logout>
    </div>
  )
}

export default page