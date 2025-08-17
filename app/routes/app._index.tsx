import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getTopSellingProducts } from "../lib/analytics.server";

type ProductRanking = {
  id: string;
  title: string;
  totalQuantity: number;
  rank: number;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  // Get top selling products from our database
  const topProducts = await getTopSellingProducts(session.shop, 10);

  if (topProducts.length === 0) {
    return { rankings: [] };
  }

  // Convert BigInt IDs to GIDs and fetch product titles
  const productIds = topProducts.map(
    (p) => `gid://shopify/Product/${p.productId}`,
  );

  const response = await admin.graphql(
    `#graphql
      query GetProductTitles($ids: [ID!]!) {
        nodes(ids: $ids) {
          ... on Product {
            id
            title
          }
        }
      }`,
    {
      variables: { ids: productIds },
    },
  );

  const responseJson = await response.json();
  const products = (responseJson.data?.nodes || []).filter(
    (p: any) => p !== null,
  );

  // Combine product data with sales data
  const rankings: ProductRanking[] = topProducts
    .map((salesData, index) => {
      const productId = `gid://shopify/Product/${salesData.productId}`;
      const product = products.find((p: any) => p && p.id === productId);

      return {
        id: productId,
        title: product?.title || `Product ${salesData.productId}`,
        totalQuantity: salesData.totalQuantity,
        rank: index + 1,
      };
    })
    .filter((ranking) => ranking.totalQuantity > 0);

  return { rankings };
};

export default function Index() {
  const { rankings } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Follow The Herd" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Welcome to Follow The Herd 🐑
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Show customers what's trending and selling fast to build
                    confidence and urgency. When shoppers see what others are
                    buying, they don't want to miss out!
                  </Text>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Top Selling Products (Last 30 Days)
                  </Text>

                  {rankings.length === 0 ? (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No sales data yet. Products will appear here as orders are
                      placed.
                    </Text>
                  ) : (
                    <Box
                      padding="400"
                      background="bg-surface-secondary"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                    >
                      <BlockStack gap="300">
                        {rankings.slice(0, 10).map((product) => (
                          <Box
                            key={product.id}
                            padding="300"
                            background="bg-surface"
                            borderWidth="025"
                            borderRadius="200"
                            borderColor="border"
                          >
                            <InlineStack align="space-between">
                              <InlineStack gap="200" align="center">
                                <Badge
                                  tone={product.rank === 1 ? "success" : "info"}
                                >
                                  {product.rank === 1
                                    ? "👑 #1"
                                    : `#${product.rank}`}
                                </Badge>
                                <Text
                                  as="span"
                                  variant="bodyMd"
                                  fontWeight={
                                    product.rank === 1 ? "bold" : "medium"
                                  }
                                >
                                  {product.title}
                                </Text>
                                {product.rank === 1 && (
                                  <Badge tone="success" size="small">
                                    Most Popular
                                  </Badge>
                                )}
                              </InlineStack>
                              <Text as="span" variant="bodyMd" tone="subdued">
                                {product.totalQuantity} sold
                              </Text>
                            </InlineStack>
                          </Box>
                        ))}
                      </BlockStack>
                    </Box>
                  )}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    How It Works
                  </Text>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd">
                      Follow The Herd automatically tracks sales data from your
                      orders and identifies trending products based on
                      quantities sold.
                    </Text>
                    <Text as="p" variant="bodyMd">
                      The most popular product gets a special metafield that you
                      can use in your theme to highlight trending items.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
