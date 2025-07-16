

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import orderSchema from '../../lib/zodvalidation';
import type { Order, Resource } from '../../types/prod';

type Inputs = z.infer<typeof orderSchema>;

interface FormProps {
  defaultValues ?: Partial<Inputs>,
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  resources: Resource[],
  nextId: React.RefObject<number>,
  submitSuccess: () => void,
};

const OrderForm = ({ defaultValues, orders, setOrders, resources, nextId, submitSuccess } : FormProps) => {

  const {register, handleSubmit, formState: { errors }, reset} = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const newOrder: Order = {
      ...data, orderId: nextId.current.toString(),
    };
    setOrders([...orders, newOrder]);
    nextId.current += 1;
    console.log(newOrder);
    console.log(data);
    reset();
    submitSuccess();
  };

  console.log(errors);

  return (
    <>
      <div>OrderForm</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className='block'>
            Resource
          </label>
          <select {...register("resourceId", {required: "Resource is Required"})}>
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
          <input {...register("startTime", { required: "Start Date Required" })} type='datetime-local' className='rounded-4xl w-2/3 p-4'></input>
          <div>
            {errors.startTime && <span> {errors.startTime.message} </span>}
          </div>
        </div>

        <div>
          <label className='block'> End Time </label>
          <input {...register("endTime", { required: "End Date Required" })} type='datetime-local' className='rounded-4xl w-2/3 p-4'></input>
          <div>
            {errors.endTime && <span> {errors.endTime.message} </span>}
          </div>
        </div>

        <button type='submit' className='rounded-4xl bg-amber-50 px-4 py-2'>
          Create Order
        </button>
      </form>
    </>
  )
}

export default OrderForm;