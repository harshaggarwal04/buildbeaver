import { requireAuth } from '@/modules/auth/utils/auth-utils';
import React from 'react'

const MainPage = async() => {
  await requireAuth();
  
  return (
    <div>
        MainPage
    </div>
  )
}

export default MainPage