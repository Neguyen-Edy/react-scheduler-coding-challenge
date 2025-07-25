'use client';

// import OrderForm from '@/components/OrderForm';
import OrderTable from '../../components/OrderTable'
import { useRouter } from 'next/navigation';
import { useOrderContext } from '../layout';

const Page = () => {
  const router = useRouter();
  const { orders } = useOrderContext();

  return (
    <>
        <div className='flex flex-col gap-5'>
          <OrderTable orders={orders}/>
          <button onClick={() => router.push("/orders/newOrder")} className='rounded-4xl bg-amber-100 p-2 hover:bg-amber-300'>
            Create New Order
          </button>
        </div>
    </>
  )
}

export default Page;