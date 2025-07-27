import { z } from "zod";

const orderSchema = z.object({
    orderId: z.string().optional(),
    resourceId: z.string().min(1, "Required Resource ID"),
    title: z.string().min(0, "Required Title "),
    status: z.enum(["Pending", "Scheduled"]).optional(),
    startTime: z.string().min(8, "Required Start Date"),
    endTime: z.string().min(8, "Required End Date"),
})
.refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "Start Date And Time Must Be Before End Date and Time",
    path: ["endTime"],
});

export default orderSchema;

