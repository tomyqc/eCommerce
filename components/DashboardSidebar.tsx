// *********************
// Role of the component: Sidebar on admin dashboard page
// Name of the component: DashboardSidebar.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <DashboardSidebar />
// Input parameters: no input parameters
// Output: sidebar for admin dashboard page
// *********************

import React from "react";
import { MdDashboard } from "react-icons/md";
import { FaTable } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaBagShopping } from "react-icons/fa6";
import { FaStore } from "react-icons/fa6";
import { MdCategory } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

import Link from "next/link";

const DashboardSidebar = () => {
  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: MdDashboard },
    { href: "/admin/orders", label: "Orders", icon: FaBagShopping },
    { href: "/admin/products", label: "Products", icon: FaTable },
    { href: "/admin/bulk-upload", label: "Bulk Upload", icon: FaFileUpload },
    { href: "/admin/categories", label: "Categories", icon: MdCategory },
    { href: "/admin/users", label: "Users", icon: FaRegUser },
    { href: "/admin/merchant", label: "Merchant", icon: FaStore },
    { href: "/admin/settings", label: "Settings", icon: FaGear },
  ];

  return (
    <nav className="relative z-[200] w-full max-w-[520px] shrink-0 p-3 xl:w-[520px] max-xl:mx-auto" aria-label="Admin menu">
      <div className="grid grid-cols-3 gap-2 max-[420px]:grid-cols-2">
        {menuItems.map(({ href, label, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
          >
            <Icon className="text-xl" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default DashboardSidebar;
