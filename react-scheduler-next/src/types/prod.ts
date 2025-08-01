export type OrderStatus = 'Pending' | 'Scheduled';

export type ResourceStatus = 'Available' | 'Busy';

interface Order {
  orderId: string,
  title: string,
  resourceId: string,
  status: OrderStatus,
  startTime: string,
  endTime: string,
};

interface Resource {
    id: string,
    name: string,
    status: ResourceStatus,
}

export type { Order, Resource };