// *********************
// IN DEVELOPMENT
// *********************

import React from "react";
const StatsElement = ({ title, value, detail }: { title: string; value: string; detail: string }) => {
  return (
    <div className="flex min-h-32 w-full flex-col items-center justify-center rounded-md bg-blue-500 text-white">
      <h4 className="text-xl text-white">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-blue-100">{detail}</p>
    </div>
  );
};

export default StatsElement;
