

import React, { useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import orderSchema from '../../lib/zodvalidation';
import type { Order, Resource } from '../../types/prod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderContext } from '@/app/layout';

type Inputs = z.infer<typeof orderSchema>;

interface FormProps {
  defaultValues?: Partial<Inputs>,
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  resources: Resource[],
  // nextId: React.RefObject<number>,
  submitSuccess: () => void,
};

const OrderForm = ({ defaultValues, orders, setOrders, resources, submitSuccess } : FormProps) => {

  const {id, setId} = useOrderContext();

  const {register, handleSubmit, formState: { errors }, reset} = useForm<Inputs>({
    resolver: zodResolver(orderSchema), defaultValues,
  });  

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (defaultValues?.orderId) {
      const updatedOrders = orders.map((o) => 
        o.orderId === defaultValues.orderId ? {...o, ...data} : o
      );
      setOrders(updatedOrders);
    }
    else {
      const newOrder: Order = {
        ...data, orderId: id.toString(), status: "Pending"
      };
      setOrders([...orders, newOrder]);
      setId(i => i + 1);
      console.log(newOrder);
    }
    console.log(data);
    console.log("New id:", id);
    reset();
    submitSuccess?.();
  };

  console.log(errors);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 border rounded-lg gap-8'>
        <div className='bold text-2xl'>Order Form</div>

        <div>
          <label className='block font-bold'> Order Title </label>
          <input {...register("title", {required: "Title Required" })} type='text' className='border rounded-4xl w-2/3 p-4' />
        </div>

        <div>
          <label className='block font-bold'>
            Resource
          </label>
          <select {...register("resourceId", {required: "Resource is Required"})} className='border rounded p-2 w-2/3'>
            <option value=""> SELECT RESOURCE </option>
            {resources.map((r, index) => (
              <option key={index} value={r.id}> {r.name} </option>
            ))}
          </select>
          <div>
            {errors.resourceId && <span> {errors.resourceId.message} </span>}
          </div>
        </div>

        <div>
          <label className='block'> Start Time </label>
          <input {...register("startTime", { required: "Start Date Required" })} type='datetime-local' className='border rounded-4xl w-2/3 p-4' />
          <div>
            {errors.startTime && <span> {errors.startTime.message} </span>}
          </div>
        </div>

        <div>
          <label className='block'> End Time </label>
          <input {...register("endTime", { required: "End Date Required" })} type='datetime-local' className='border rounded-4xl w-2/3 p-4' />
          <div>
            {errors.endTime && <span> {errors.endTime.message} </span>}
          </div>
        </div>

        <button type='submit' className='rounded-4xl bg-amber-100 px-4 py-2 hover:bg-amber-300'>
          {defaultValues ? "Edit Order" : "Create Order"}
        </button>
      </form>
    </>
  )
}

export default OrderForm;