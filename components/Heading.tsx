// *********************
// Role of the component: Simple H2 heading component
// Name of the component: Heading.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Heading title={title} />
// Input parameters: { title: string }
// Output: h2 heading title with some styles 
// *********************

import React from 'react'

const Heading = ({ title, className = "" } : { title: string; className?: string }) => {
  return (
    <h2 className={`mt-20 text-center text-4xl font-extrabold text-black max-lg:text-3xl ${className}`}>{ title }</h2>
  )
}

export default Heading