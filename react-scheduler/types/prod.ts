type OrderStatus = 'Pending' | 'Scheduled';

type ResourceStatus = 'Available' | 'Busy';

interface Order {
  orderId: string,
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

export { Order, Resource };