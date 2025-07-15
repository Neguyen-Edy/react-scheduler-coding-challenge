import { useState, useRef } from 'react'
import OrderTable from '../../components/OrderTable';
import OrderForm from '../../components/OrderForm';
import type { Order } from '../../../types/prod';
import predefinedResources from '../../../data/resources'

const Page = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const nextId = useRef(0);
  const [resources] = useState(predefinedResources);

  return (
    <>
      <div className='bg-indigo-950/20'>Orders</div>
      <OrderTable />
      <OrderForm orders={orders} setOrders={setOrders} resources={resources} nextId={nextId}/>
    </>
  )
};

export default Page