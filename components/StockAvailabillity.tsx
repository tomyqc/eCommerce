// *********************
// Role of the component: Stock availability component for displaying current stock status of the product
// Name of the component: StockAvailabillity.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <StockAvailabillity stock={stock} inStock={inStock} />
// Input parameters: { stock: number, inStock: number }
// Output: styled text that displays current stock status on the single product page
// *********************

import React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { FaXmark } from "react-icons/fa6";


const StockAvailabillity = ({ stock, inStock } : { stock: number, inStock: number }) => {
  return (
    <p className='grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3 text-xl max-[500px]:gap-2'>
    <span className="text-left">Availability:</span>
    { inStock === 1 ? <span className='text-success flex items-center justify-center gap-x-1'>In stock <FaCheck /></span> :  <span className='text-error flex items-center justify-center gap-x-1'>Out of stock <FaXmark /></span>}
    <span className='text-right' dir='rtl'>الوفرة:</span>
    
    
    </p>
  )
}

export default StockAvailabillity