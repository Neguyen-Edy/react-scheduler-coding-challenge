'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Order, OrderStatus, Resource, ResourceStatus } from '../../types/prod';
import { useRouter } from 'next/navigation';

const columnHelper = createColumnHelper<Order>();

const columns = [
  columnHelper.accessor('orderId', {
    cell: info => <Link href={{pathname:"/orders/newOrder", query: {id: info.getValue()}}}>
      {info.getValue()}
      </Link>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.resourceId, {
    id: 'Resource Id',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Resource Id</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.title, {
    id: 'Title',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Title</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.status, {
    id: 'Status',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Status</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.startTime, {
    id: 'Start Time',
    cell: info => {
      const date = new Date(info.getValue());
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    },
    header: () => <span>Start Time</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor(row => row.endTime, {
    id: 'End Time',
    cell: info => {
      const date = new Date(info.getValue());
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    },
    header: () => <span>End Time</span>,
    footer: info => info.column.id,
  }),
]; 

interface OrderTableProps {
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  resources: Resource[],
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
}

interface ColumnFilters {
  id: string;
  value: OrderStatus | string
}

const SCHEDULED: OrderStatus = "Scheduled";
const BUSY: ResourceStatus = "Busy";
const AVAILABLE: ResourceStatus = "Available";

const OrderTable = ({orders, setOrders, resources, setResources} : OrderTableProps) => {

  const data = orders;
  const [columnFilters, setColumnFilters] = useState<ColumnFilters[]>([]);
  const router = useRouter();

  console.log(orders);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  //Table Filtering
  const title = columnFilters.find((f) => f.id === "Title")?.value || "";

  const onFilterChange = (id : string, value : string) => setColumnFilters(
    prev => prev.filter(f => f.id !== id).concat({
      id, value
    })
  );

  //Scheduling Order
  const scheduleOrder = (orderId : string, resourceId : string) => {    
    const resource = resources.find((r) => r.id === resourceId);
    const scheduledOrder = orders.find((o) => o.orderId === orderId);

    //check if there is a time conflict if the resource is currently busy
    if (resource && resource.status === 'Busy') {
      if (scheduledOrder && checkTimeConflicts(scheduledOrder, orders)) {
        alert("Resource Is Currently Busy");
        return;
      }
    }

    const updatedOrders = orders.map((order) => { //update order to scheduled
      if (order.orderId === orderId) {
        return { ...order, status: SCHEDULED };
      }
      return order;
    }); 

    const updatedResources = resources.map((resource) => { //update resource to busy
      if (resource.id === resourceId) {
        return {...resource, status: BUSY}
      }
      return resource;
    });
    
    updatedOrders.forEach((o, i) => { //DEBUG LOG
      if (Array.isArray(o)) console.log(`${i} has an array`)
      console.log(`index ${i}`, o);
    })
    console.log(updatedOrders);
    console.log(updatedResources);

    setOrders(updatedOrders);
    setResources(updatedResources);
  };

  //returns true if there is a time conflict; false otherwise
  const checkTimeConflicts = (newOrder : Order, orders : Order[]) => {
    const newOrderStart = newOrder.startTime;
    const newOrderEnd = newOrder.endTime;
    
    return orders.some((order) => {
      if (order.status === 'Pending') return false;
      if (order.resourceId !== newOrder.resourceId) return false;
  
      const existingOrderStart = order.startTime;
      const existingOrderEnd = order.endTime;
  
      return newOrderStart < existingOrderEnd && existingOrderStart < newOrderEnd;
    });
  };

  //delete order, make resource available
  const deleteOrder = (orderId : string, resourceId : string) => {    
    const updatedOrders = orders.filter((order) => order.orderId !== orderId); 
    const sharedResourceOrders = orders.filter((order) => order.resourceId === resourceId && order.status === 'Scheduled');

    updatedOrders.forEach((o, i) => {
      if (Array.isArray(o)) console.log(`${i} has an array`)
      console.log(`index ${i}`, o);
    })
    console.log(updatedOrders);

    const updatedResources = resources.map((resource) => {
      if (resource.id === resourceId && sharedResourceOrders.length === 1) return {...resource, status: AVAILABLE};

      return resource;
    })


    setOrders(updatedOrders);
    setResources(updatedResources);
  };

  // console.log(columnFilters);

  return (
    <div className='p-2'>
      <div className='flex flex-row gap-4 m-2'>
        <input onChange={(e) => onFilterChange("Title", e.target.value)} type='text' placeholder='Search Order' value={title} className='p-4 border'></input>
        <select className='border rounded p-4 w-3/4 self-center' onChange={(e) => {
          const selectValue = e.target.value;
          setColumnFilters(
            prev => {
              const withoutStatus = prev.filter(f => f.id !== "Status");
              
              if (!selectValue) {
                return withoutStatus;
              }

              return [...withoutStatus, { id: "Status", value: selectValue}];
            }
          )
        }}>
          <option value=""> Filter By... </option>
          <option value="Pending" > Pending </option>
          <option value="Scheduled" > Scheduled </option>
        </select>
      </div>
      <table className='w-full border border-gray-300'>
        <thead className='bg-gray-200'>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className='border text-left p-3'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
              <th className='border text-left p-3'>Actions</th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td className='text-center p-4'>
                No Orders Found
              </td>
            </tr>
          ) : 
            (table.getRowModel().rows.map((rowGroup) => (
            <tr key={rowGroup.id} className='border'>
              {rowGroup.getVisibleCells().map((cell) => (
                <td key={cell.id} className='p-2 border'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td className='flex flex-col gap-2 p-4'>
                <button onClick={() => router.push(`/orders/newOrder?id=${rowGroup.getValue("orderId")}`)} data-testid={`${rowGroup.getValue("orderId")}-edit`} className='border rounded-4xl hover:bg-gray-200'>
                  Edit Order
                </button>
                <button onClick={() => scheduleOrder(rowGroup.getValue("orderId"), rowGroup.getValue("Resource Id"))} className='border rounded-4xl hover:bg-gray-200' data-testid={`${rowGroup.getValue("orderId")}-schedule`}>
                  Schedule Order
                </button>
                <button onClick={() => deleteOrder(rowGroup.getValue("orderId"), rowGroup.getValue("Resource Id"))} className='border rounded-4xl hover:bg-gray-200' data-testid={`${rowGroup.getValue("orderId")}-delete`}>
                  Delete Order
                </button>
              </td>
            </tr>
          )))}
        </tbody>
        <tfoot className='bg-gray-200'>
          {table.getFooterGroups().map(footerGroup => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map(header => (
                <th key={header.id} className='border text-left p-3'>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
              <th className='border text-left p-3'>Actions</th>
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  )
}

export default OrderTable;