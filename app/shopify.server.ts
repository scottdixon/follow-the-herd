import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import {
  getMostPopularMonthlyMetafieldDefinition,
  createMostPopularMonthlyMetafieldDefinition,
} from "./lib/metafields.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  hooks: {
    afterAuth: async ({ admin, session }) => {
      await shopify.registerWebhooks({ session });

      try {
        const metafieldDefinition =
          await getMostPopularMonthlyMetafieldDefinition(admin);

        if (metafieldDefinition == null) {
          console.log("Creating Most Popular Monthly metafield definition...");
          const createdMetafield =
            await createMostPopularMonthlyMetafieldDefinition(admin);
          console.log(
            "Successfully created metafield definition:",
            createdMetafield?.name,
          );
        } else {
          console.log(
            "Most Popular Monthly metafield definition already exists",
          );
        }
      } catch (error: any) {
        console.error("Error managing metafield definition:", error);

        if ("graphQLErrors" in error) {
          console.error("GraphQL errors:", error.graphQLErrors);
        } else {
          console.error("Other error:", error);
        }

        // Don't throw the error to prevent auth from failing
        // The app can still function without the metafield
      }
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
