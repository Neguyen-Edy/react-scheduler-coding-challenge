import { z } from "zod";

const orderSchema = z.object({
    orderID: z.string().min(1, "Required ID"),
    resourceID: z.string().min(1, "Required Resource ID"),
    status: z.enum(["Pending", "Scheduled"]),
    startTime: z.string(),
    endTime: z.string(),
});

export default orderSchema;

