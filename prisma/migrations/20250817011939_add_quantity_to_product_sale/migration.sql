-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ProductSale" ("createdAt", "id", "productId", "shop") SELECT "createdAt", "id", "productId", "shop" FROM "ProductSale";
DROP TABLE "ProductSale";
ALTER TABLE "new_ProductSale" RENAME TO "ProductSale";
CREATE INDEX "ProductSale_shop_createdAt_idx" ON "ProductSale"("shop", "createdAt");
CREATE INDEX "ProductSale_shop_productId_createdAt_idx" ON "ProductSale"("shop", "productId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
