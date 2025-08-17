import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import {
  calculateMostPopularProductLastMonth,
  updateMostPopularProduct,
  getCurrentMostPopularProduct,
} from "../lib/analytics.server";
import {
  setMostPopularMonthlyMetafield,
  clearPreviousMostPopularMetafield,
} from "../lib/metafields.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, admin, session } =
    await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger after an app is uninstalled
  // If the app is already uninstalled, the session may be undefined.
  if (!session) {
    console.log(`No session found for shop ${shop} - app may be uninstalled`);
    throw new Response();
  }

  try {
    const order = payload as any;
    const lineItems = order.line_items || [];

    // Extract product IDs and their quantities from the order line items
    const productQuantities = new Map<string, number>();
    for (const item of lineItems) {
      if (item.product_id && item.quantity) {
        const productId = item.product_id.toString();
        const currentQty = productQuantities.get(productId) || 0;
        productQuantities.set(productId, currentQty + item.quantity);
      }
    }

    // Save each unique product ID as a separate sale record with quantity
    for (const [productId, quantity] of productQuantities) {
      console.log(
        `Saving product sale for shop ${shop}, product ${productId}, quantity ${quantity}`,
      );
      await db.productSale.create({
        data: {
          shop,
          productId: BigInt(productId),
          quantity: quantity,
        },
      });
    }

    console.log(
      `Saved ${productQuantities.size} product sales for shop ${shop}`,
    );

    // Calculate and update the most popular product for this shop
    try {
      const currentMostPopular = await getCurrentMostPopularProduct(shop);
      const newMostPopular = await calculateMostPopularProductLastMonth(shop);

      if (newMostPopular && newMostPopular !== currentMostPopular) {
        // Update the database record
        await updateMostPopularProduct(shop, newMostPopular);

        // Update metafields in Shopify
        try {
          // Clear the previous product's metafield if it exists
          if (currentMostPopular) {
            await clearPreviousMostPopularMetafield(admin, currentMostPopular);
            console.log(
              `Cleared metafield for previous popular product: ${currentMostPopular}`,
            );
          }

          // Set the new product's metafield to true
          await setMostPopularMonthlyMetafield(admin, newMostPopular, true);
          console.log(
            `Set metafield for new popular product: ${newMostPopular}`,
          );
        } catch (metafieldError) {
          console.error("Error updating metafields:", metafieldError);
          // Don't throw - analytics update succeeded even if metafields failed
        }

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
