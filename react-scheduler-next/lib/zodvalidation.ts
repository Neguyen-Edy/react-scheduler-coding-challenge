import { z } from "zod";

const orderSchema = z.object({
    orderId: z.string().min(1, "Required ID").optional(),
    resourceId: z.string().min(1, "Required Resource ID"),
    title: z.string(),
    status: z.enum(["Pending", "Scheduled"]).optional(),
    startTime: z.string(),
    endTime: z.string(),
});

export default orderSchema;

