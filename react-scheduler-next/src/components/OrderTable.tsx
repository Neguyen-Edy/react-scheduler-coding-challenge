'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Order } from '../../types/prod';
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
}

const OrderTable = ({orders} : OrderTableProps) => {

  const [data] = useState(() => [...orders]);
  const router = useRouter();

  console.log(orders);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='p-2'>
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
                <button onClick={() => router.push(`/orders/newOrder?id=${rowGroup.getValue("orderId")}`)} className='border rounded-4xl hover:bg-gray-200'>
                  Edit Order
                </button>
                <button className='border rounded-4xl hover:bg-gray-200'>
                  Schedule Order
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

export default OrderTable

// {
//     id: "action",
//     header: "Actions",
//     cell: (row: { original: Order; }) => {
//       const order = row.original;
//       return (
//         <div>
//           <button>
//             Edit Order
//           </button>
//           <button>
//             Schedule Order
//           </button>
//         </div>
//       );
//     }
//   }