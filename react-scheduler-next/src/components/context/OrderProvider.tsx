'use client';

import Link from "next/link";
import { createContext, useState, useContext, useEffect } from "react";
import { Order, Resource } from "@/types/prod";
import predefinedResources from "@/data/resources";

interface OrdersContextType {
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    id: number,
    setId: React.Dispatch<React.SetStateAction<number>>,
    resources: Resource[],
    setResources: React.Dispatch<React.SetStateAction<Resource[]>>,
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}

const OrderProvider = ({ children }: { children: React.ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [id, setId] = useState(0);
    const [resources, setResources] = useState(predefinedResources);

    useEffect(() => {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            try {
                setOrders(JSON.parse(storedOrders));
            } catch (e) {
                console.error("Invalid JSON in localStorage for 'orders'");
                console.error(e);
            }
        }

        const storedId = localStorage.getItem('id');
        if (storedId) setId(Number(storedId));

        const storedResources = localStorage.getItem('resources');
        if (storedResources) {
        try {
            setResources(JSON.parse(storedResources));
        } catch (e) {
            console.error("Invalid JSON in localStorage for 'resources'");
            console.error(e);
        }
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem('id', id.toString());
    }, [id]);

    useEffect(() => {
        localStorage.setItem('resources', JSON.stringify(resources));
    }, [resources]);

    return (
        <>
            <nav className="bg-gray-600 text-white font-bold flex gap-4 p-4">
                <Link href='/dashboard' className="hover:text-amber-300 hover:shadow-2xs"> Dashboard </Link>
                <Link href='/orders' className="hover:text-amber-300 hover:shadow-2xs"> Order List </Link>
            </nav>
            <OrdersContext.Provider value={{ orders, setOrders, id, setId, resources, setResources }}>
                {children}
            </OrdersContext.Provider>
        </>
    )
};

export default OrderProvider