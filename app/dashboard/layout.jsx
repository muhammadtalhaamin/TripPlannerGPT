import React from 'react'
import Header from './_components/Header'

// DashboardLayout component that wraps the entire dashboard
function DashboardLayout({children}) {
  return (
    <div>
        <Header/>
        {children}
    </div>
  )
}

export default DashboardLayout