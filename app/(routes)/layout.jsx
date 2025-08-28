import React from 'react';
import AppHeader from '../(routes)/_components/AppHeader';
function DashboardLayout({children}){
    return(
        <div>
            <AppHeader/>
            {children}
        </div>
    )
}
export default DashboardLayout;