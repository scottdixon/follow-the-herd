import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  calculateMostPopularProductLastMonth,
  updateMostPopularProduct,
  getCurrentMostPopularProduct,
} from "../lib/analytics.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const order = payload as any;
    const lineItems = order.line_items || [];

    // Extract unique product IDs from the order line items
    const productIds = new Set<string>();
    for (const item of lineItems) {
      if (item.product_id) {
        productIds.add(item.product_id.toString());
      }
    }

    // Save each unique product ID as a separate sale record
    for (const productId of productIds) {
      console.log(
        `Saving product sale for shop ${shop} and product ${productId}`,
      );
      await db.productSale.create({
        data: {
          shop,
          productId: BigInt(productId),
        },
      });
    }

    console.log(`Saved ${productIds.size} product sales for shop ${shop}`);

    // Calculate and update the most popular product for this shop
    try {
      const currentMostPopular = await getCurrentMostPopularProduct(shop);
      const newMostPopular = await calculateMostPopularProductLastMonth(shop);

      if (newMostPopular && newMostPopular !== currentMostPopular) {
        await updateMostPopularProduct(shop, newMostPopular);
        console.log(
          `Updated most popular product for shop ${shop}: ${newMostPopular}`,
        );
      } else {
        console.log(
          `No new most popular product for shop ${shop}: ${currentMostPopular}`,
        );
      }
    } catch (analyticsError) {
      console.error("Error updating most popular product:", analyticsError);
      // Don't throw - this is not critical for webhook processing
    }
  } catch (error) {
    console.error("Error processing order webhook:", error);
    // Still return success to avoid webhook retries
  }

  return new Response();
};
