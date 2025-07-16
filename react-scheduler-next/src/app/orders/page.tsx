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
        <OrderTable orders={orders}/>
        <button onClick={() => router.push("/orders/newOrder")}>
          Create New Order
        </button>
        {/* <OrderForm orders={orders} setOrders={setOrders} resources={resources} nextId={nextId} /> */}
    </>
  )
}

export default Page;