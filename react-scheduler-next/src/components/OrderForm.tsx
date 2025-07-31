

import React from 'react';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { z } from 'zod';
import orderSchema from '../../lib/zodvalidation';
import type { Order, Resource, ResourceStatus } from '../../types/prod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOrderContext } from '@/app/layout';

type Inputs = z.infer<typeof orderSchema>;

interface FormProps {
  defaultValues?: Partial<Inputs>,
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
  submitSuccess: () => void,
};

const OrderForm = ({ defaultValues, orders, setOrders, resources, setResources, submitSuccess } : FormProps) => {

  const BUSY: ResourceStatus = "Busy";
  const AVAILABLE: ResourceStatus = "Available";

  const {id, setId} = useOrderContext();

  const {register, handleSubmit, setError, formState: { errors }, reset, control} = useForm<Inputs>({
    resolver: zodResolver(orderSchema), defaultValues,
  });  

  const selectedResourceId = useWatch({
    control,
    name: "resourceId",
  });

  console.log(resources);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (defaultValues?.orderId) {
      console.log(data);
      console.log(defaultValues);
      
      const updatedOrder = {
        ...defaultValues, ...data
      };

      console.log(updatedOrder);

      const updatedResources = resources.map((resource) => { //update resources accordingly
        if (resource.id === updatedOrder.resourceId) {
          return {...resource, status: BUSY}
        }

        //check to see if there are other orders that share the same resource before edit to change resource status
        for (const order of orders) {
          if (order.orderId !== defaultValues.orderId) {
            if (order.status === "Scheduled" && order.resourceId === defaultValues.resourceId) {
              if (resource.id === defaultValues.resourceId) {
                return {...resource, status: BUSY}
              }
            }
          }
        }

        return {...resource, status: AVAILABLE};
      });

      console.log(updatedResources);

      if (checkTimeConflicts(updatedOrder, orders)) {
        console.log("checked time conflicts");
        setError("startTime", {
          type: "manual",
          message: "This resource is already booked during this time. Please choose another time.",
        });
        return;
      }

      const updatedOrders = orders.map((o) => 
        o.orderId === defaultValues.orderId ? {...o, ...data} : o
      );

      setOrders(updatedOrders);
      setResources(updatedResources);
    }
    else {
      const newOrder: Order = {
        ...data, orderId: id.toString(), status: "Pending"
      };
      console.log(newOrder);

      if (!checkTimeConflicts(newOrder, orders)) {
        setOrders([...orders, newOrder]);
        setId(i => i + 1);
        console.log("New id:", id);
      }
      else {
        setError("startTime", {
          type: "manual",
          message: "This resource is already booked during that time.",
        });
        return;
      }
    }
    reset();
    submitSuccess?.();
  };

  //returns true if there is a time conflict; false otherwise
  const checkTimeConflicts = (newOrder : Order | Inputs, orders : Order[]) => {
    const newOrderStart = newOrder.startTime;
    const newOrderEnd = newOrder.endTime;

    console.log(newOrder);

    return orders.some((order) => {
      if (order.status === 'Pending') return false;
      if (order.resourceId !== newOrder.resourceId) return false;
      if (order.orderId === newOrder.orderId) return false;

      console.log(order);

      const existingOrderStart = order.startTime;
      const existingOrderEnd = order.endTime;

      return newOrderStart < existingOrderEnd && existingOrderStart < newOrderEnd;
    });
  };

  const resourceBusyText = (resourceId : string) => {
    if (defaultValues?.orderId) {
      if (resourceId === defaultValues?.resourceId) return null;
    }
    
    return (
      <div>
        <div className='font-bold text-red-800'> 
          WARNING!!! THIS RESOURCE IS CURRENTLY BUSY!!!
        </div>
        <div className='font-bold text-red-800'> 
          CHECK THE ORDER TABLE!!!
        </div>
      </div>
    );
  }

  console.log(errors);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 border rounded-lg gap-8'>
        <div className='bold text-2xl'>Order Form</div>

        <div>
          <label htmlFor='order-title' className='block font-bold'> Order Title </label>
          <input {...register("title", {required: "Title Required" })} type='text' id='order-title' className='border rounded-4xl w-2/3 p-4' />
          <div>
            {errors.title && <span> {errors.title.message} </span>}
          </div>
        </div>

        <div>
          <label htmlFor='order-resource' className='block font-bold'> Resource </label>
          <select {...register("resourceId", {required: "Resource is Required"})} id='order-resource' className='border rounded p-2 w-2/3'>
            <option value=""> SELECT RESOURCE </option>
            {resources.map((r, index) => {
              return <option key={index} value={r.id}> {r.name} </option>
            })}
          </select>
          <div>
            {errors.resourceId && <span> {errors.resourceId.message} </span>}
          </div>
          {resources.find((r) => r.id === selectedResourceId)?.status === "Busy" && resourceBusyText(selectedResourceId)}
        </div>

        <div>
          <label className='block' htmlFor='order-start'> Start Time </label>
          <input {...register("startTime", { required: "Start Date Required" })} type='datetime-local' id='order-start' className='border rounded-4xl w-2/3 p-4' />
          <div>
            {errors.startTime && <span> {errors.startTime.message} </span>}
          </div>
        </div>

        <div>
          <label className='block' htmlFor='order-end'> End Time </label>
          <input {...register("endTime", { required: "End Date Required" })} type='datetime-local' id='order-end' className='border rounded-4xl w-2/3 p-4' />
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