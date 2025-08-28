import React from 'react'
import { UserButton } from '@clerk/nextjs'
const MenuOption=[
    {
        name:'Dashboard',
        path:'/dashboard'
    },
    {
        name:"Upgrade",
        path:"/upgrade"
    },
    {
        name:"How it works?",
        path:'/how-it-works'
    }
]

function AppHeader() {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-2xl">Ai-mock-interview</h1>
      </div>
      <div>
        <ul className='flex items-center gap-6'>
            {
                MenuOption.map((option,index)=>(
                    <li key={index} className='text-base font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'>
                        <a href={option.path}>{option.name}</a>
                    </li>
                ))
            }
        </ul>
      </div>
      <UserButton/>
    </nav>
  )
}

export default AppHeader
