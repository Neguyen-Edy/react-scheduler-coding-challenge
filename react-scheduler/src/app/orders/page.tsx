// import React from 'react'
import OrderTable from '../../components/OrderTable';

// type OrderStatus = 'Pending' | 'Done';

// type ResourceStatus = 'Available' | 'Busy';

// interface Order {
//   orderId: string,
//   resourceId: string,
//   status: OrderStatus,
//   startTime: string,
//   endTime: string,
// };

// interface Resource {
//     id: string,
//     name: string,
//     status: ResourceStatus,
// }

const page = () => {
  return (
    <>
      <div className='bg-indigo-950'>Orders</div>
      <OrderTable />
    </>
  )
}

export default page