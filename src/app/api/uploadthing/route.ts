import { createNextRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import {absoluteUrl} from "@/lib/utils";

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
    router: ourFileRouter,
    config: {
        callbackUrl: absoluteUrl("/api/uploadthing")
    }
});
