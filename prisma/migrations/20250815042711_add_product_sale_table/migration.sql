-- Add ProductSale table
CREATE TABLE "ProductSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "ProductSale_shop_createdAt_idx" ON "ProductSale"("shop", "createdAt");
CREATE INDEX "ProductSale_shop_productId_createdAt_idx" ON "ProductSale"("shop", "productId", "createdAt");
