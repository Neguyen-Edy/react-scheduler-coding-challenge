'use client';

import { useState, useRef } from 'react'
import OrderForm from '../../../components/OrderForm';
import { Order } from '../../../../types/prod';
import predefinedResources from '../../../../data/resources';
import { useRouter } from 'next/navigation';

const Page = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const nextId = useRef(0);
  const [resources] = useState(predefinedResources);
  const router = useRouter();

  return (
    <>
      <div className='bg-indigo-950/20'>Orders</div>
      <OrderForm orders={orders} setOrders={setOrders} resources={resources} nextId={nextId} submitSuccess={(() => router.push('/orders'))}/>
    </>
  )
};

export default Page;