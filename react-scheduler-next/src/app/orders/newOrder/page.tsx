'use client';

import { useRef } from 'react'
import OrderForm from '../../../components/OrderForm';
import predefinedResources from '../../../../data/resources';
import { useRouter } from 'next/navigation';
import { useOrderContext } from '@/app/layout';

const Page = () => {
  const nextId = useRef(0);
  const router = useRouter();
  const {orders, setOrders} = useOrderContext();

  return (
    <>
      <div className='bg-indigo-950/20'>Orders</div>
      <OrderForm orders={orders} setOrders={setOrders} resources={predefinedResources} nextId={nextId} submitSuccess={(() => router.push('/orders'))}/>
    </>
  )
};

export default Page;