/**
 * Analytics functions for the Follow The Herd app
 */

import db from "../db.server";

// Calculate the most popular product for a shop over the last month
export async function calculateMostPopularProductLastMonth(
  shop: string,
): Promise<bigint | null> {
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
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 1,
  });

  return popularProducts.length > 0 ? popularProducts[0].productId : null;
}

// Update the most popular product for a shop
export async function updateMostPopularProduct(
  shop: string,
  productId: bigint,
): Promise<void> {
  await db.mostPopularProduct.upsert({
    where: { shop },
    update: { productId: productId },
    create: { shop, productId: productId },
  });
}

// Get the current most popular product for a shop
export async function getCurrentMostPopularProduct(
  shop: string,
): Promise<bigint | null> {
  const result = await db.mostPopularProduct.findUnique({
    where: { shop },
    select: { productId: true },
  });

  return result?.productId || null;
}

// Get top selling products for a shop (with quantities)
export async function getTopSellingProducts(
  shop: string,
  limit: number = 10,
): Promise<Array<{ productId: bigint; totalQuantity: number }>> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const topProducts = await db.productSale.groupBy({
    by: ["productId"],
    where: {
      shop,
      createdAt: {
        gte: oneMonthAgo,
      },
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  });

  return topProducts.map((product: any) => ({
    productId: product.productId,
    totalQuantity: product._sum.quantity || 0,
  }));
}
