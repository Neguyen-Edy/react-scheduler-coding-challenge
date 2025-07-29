'use client';

import OrderForm from '../../../components/OrderForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrderContext } from '@/app/layout';

const Page = () => {
  // const nextId = useRef(0);
  const router = useRouter();
  const {orders, setOrders, resources} = useOrderContext();

  const orderIdParam = useSearchParams();
  const defaultOrderId = orderIdParam.get("id");
  const order = orders.find((o) => o.orderId === defaultOrderId);
  // console.log("New nextId:", nextId.current);

  return (
    <>
      <OrderForm defaultValues={order} orders={orders} setOrders={setOrders} resources={resources} submitSuccess={(() => router.push('/orders'))}/>
    </>
  )
};

export default Page;