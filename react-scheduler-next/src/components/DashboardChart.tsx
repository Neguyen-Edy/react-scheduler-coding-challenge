'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, TooltipContentProps } from 'recharts';
import { Order } from '../../types/prod';
import predefinedResources from '../../data/resources';
import { useState } from 'react';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

interface DashboardProps {
  orders: Order[],
}

const DashboardChart = ({orders}: DashboardProps) => {
  
  const [zoom, setZoom] = useState(1);
  
  //grab resources that have a scheduled order and filter the orders list to only have scheduled orders
  const existingResourcesId = new Set(orders.filter((o) => o.status === 'Scheduled').map((o) => o.resourceId));
  const filteredOrders = orders.filter((o) => o.status === 'Scheduled' && existingResourcesId.has(o.resourceId));

  //create dummy orders for resources not in use to display if the chart is displayed
  const dummyOrders : Order[] = predefinedResources.filter((res) => !existingResourcesId.has(res.id))
    .map((res) => ({
      resourceId: res.id,
      startTime: new Date(Date.now()).toISOString(),
      endTime: new Date(Date.now()).toISOString(),
      title: "",
      orderId: "00",
      status: "Scheduled",
    }));

  //merge scheduled orders and dummy orders, also add in numeric value of start date, end date, and duration added to make bars
  const data = [...filteredOrders, ...dummyOrders].map((order) => {
    const start = new Date(order.startTime).getTime(); 
    const end = new Date(order.endTime).getTime();
    const duration = end - start;
    return {
      ...order,
      start,
      end,
      duration,
    }
  });

  const minTime = Math.min(...data.map((o) => o.start)); 
  const maxTime = Math.max(...data.map((o) => o.end));

  //manually set the ticks for x-axis
  const generateShiftedTicks = (min: number, max: number) => {
    const step = 3600000 * 10;
    const ticks = [];
    for (let t = min; t <= max; t += step) {
      ticks.push(t - min); // shift it
    }
    return ticks;
  };

  //shift the data to make the bars be correctly displayed on the screen
  const shiftedData = data.map((order) => {
    const startShifted = order.start - minTime;
    const endShifted = order.end - minTime;
    const rowId = `${order.resourceId}-${order.orderId}`;
    return {
      ...order,
      start: startShifted,
      end: endShifted,
      rowId
    };
  });

  //only allow tool tip to show up if there is a green bar (duration !== 0)
  const customToolTip = ({ active, payload } : TooltipContentProps<ValueType, NameType>) => {
    if (active && payload && payload.length > 0 && payload.length > 1) {
      const order = payload[1];
      console.log(payload)
      
      if (order.payload.duration === 0) return null;

      return (
        <div className='border bg-white'>
          <p>{`Title : ${order.payload.title}`}</p>
          <p>{`Start Date : ${new Date(order.payload.startTime).toLocaleString([], 
              { month: "short", day:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"})}`
            }
          </p>
          <p>{`End Date : ${new Date(order.payload.endTime).toLocaleString([], 
              { month: "short", day:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit"})}`
            }
          </p>
        </div>
      );
    }
    return null;
  }
  console.log(filteredOrders);
  console.log(existingResourcesId);
  console.log(dummyOrders);
  console.log(shiftedData);
  console.log(minTime);
  console.log(maxTime);

  const minChartSpan = 6 * (1000 * 60 * 60 * 24); //if the chart becomes to small due to order list max duration, use this value
  const timeRange = Math.max(maxTime - minTime, minChartSpan);

  const pixelsPerHour = 10; 

  //used to dynamically change the width of the chart
  //default/min width: 1440 px
  const chartWidth = (timeRange / (60 * 60 * 1000)) * pixelsPerHour * zoom;
  
  const padding = (60 * 60 * 1000) * 6; // padding to shift the x-axis to 6 hours before min and after max

  return (
    <div className='overflow-x-auto' >
      {existingResourcesId.size === 0 ?
      (
        <div className='m-4 text-center p-30 border font-bold text-2xl'> No Orders To Display </div>
      ) : (
        <div style={{ width: `${chartWidth}px`}} data-testid="orders-chart">
        <ResponsiveContainer width="100%" height={500}>
          <BarChart key={`${minTime}-${maxTime}`} width={2000} layout="vertical" 
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }} data={shiftedData}>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type='number' data-testid="xaxis"  dataKey="start" scale="time" domain={[-padding, maxTime - minTime + padding]} ticks={generateShiftedTicks(minTime, maxTime)} 
              tickFormatter={(tick) => {
                return new Date(tick + minTime).toLocaleString([], {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
            }}/>
            <YAxis type='category' dataKey="rowId" data-testid="yaxis" 
              tickFormatter={(rowId) => {
                if (typeof rowId !== "string") return "";
                const [resourceId, orderId] = rowId.split('-');
                const resource = predefinedResources.find(r => r.id === resourceId);
                return resource && orderId !== '00' ? `Resource: ${resource?.name}(Order ${orderId})` : `Resource: ${resource?.name}`;
              }}/>

            <Tooltip content={customToolTip} />
            
            <Bar dataKey="start" barSize={30} fill="transparent" stackId='b'/>
            <Bar dataKey="duration" barSize={30} fill="lightgreen" stackId='b' data-testid=""/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )
      }

      {/* zoom adjust buttons */}
      <div className='flex flex-row gap-2 p-8'>
        <button className='border p-2' onClick={() => setZoom((z) => Math.min(z * 2, 4))}>Zoom In</button>
        <button className='border p-2' onClick={() => setZoom((z) => Math.max(z / 2, 0.5))}>Zoom Out</button>
      </div>
    </div>
  );
}

export default DashboardChart