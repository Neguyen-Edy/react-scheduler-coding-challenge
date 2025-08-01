'use client';

import DashboardChart from "@/components/DashboardChart";
import { useOrderContext } from "@/components/context/OrderProvider";


const Page = () => {

  const { orders } = useOrderContext();

  return (
    <>
      {/* <div className="bg-amber-300">Dashboard</div> */}
      <DashboardChart orders={orders}/>
    </>
  )
}

export default Page;