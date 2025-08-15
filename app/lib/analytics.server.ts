/**
 * Analytics functions for the Follow The Herd app
 */

import db from "../db.server";

// Calculate the most popular product for a shop over the last month
export async function calculateMostPopularProductLastMonth(
  shop: string,
): Promise<BigInt | null> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const popularProducts = await db.productSale.groupBy({
    by: ["productId"],
    where: {
      shop,
      createdAt: {
        gte: oneMonthAgo,
      },
    },
    _count: {
      productId: true,
    },
    orderBy: {
      _count: {
        productId: "desc",
      },
    },
    take: 1,
  });

  return popularProducts.length > 0 ? popularProducts[0].productId : null;
}

// Update the most popular product for a shop
export async function updateMostPopularProduct(
  shop: string,
  productId: BigInt,
): Promise<void> {
  await db.mostPopularProduct.upsert({
    where: { shop },
    update: { productId },
    create: { shop, productId },
  });
}

// Get the current most popular product for a shop
export async function getCurrentMostPopularProduct(
  shop: string,
): Promise<BigInt | null> {
  const result = await db.mostPopularProduct.findUnique({
    where: { shop },
    select: { productId: true },
  });

  return result?.productId || null;
}
