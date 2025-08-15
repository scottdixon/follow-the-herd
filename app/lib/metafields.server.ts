/**
 * Metafield operations for the Follow The Herd app
 */

// Function to check if the "Most Popular Monthly" metafield definition exists
export async function getMostPopularMonthlyMetafieldDefinition(admin: any) {
  const response = await admin.graphql(`
    #graphql
    query GetMetafieldDefinitions {
      metafieldDefinitions(first: 100, ownerType: PRODUCT) {
        edges {
          node {
            id
            name
            namespace
            key
            type {
              name
            }
          }
        }
      }
    }
  `);

  const data = await response.json();
  const definitions = data.data?.metafieldDefinitions?.edges || [];

  return (
    definitions.find(
      (edge: any) =>
        edge.node.namespace === "custom" &&
        edge.node.key === "most_popular_monthly",
    )?.node || null
  );
}

// Function to create the "Most Popular Monthly" metafield definition
export async function createMostPopularMonthlyMetafieldDefinition(admin: any) {
  const response = await admin.graphql(
    `
    #graphql
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
          namespace
          key
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `,
    {
      variables: {
        definition: {
          name: "Most Popular Monthly",
          namespace: "custom",
          key: "most_popular_monthly",
          description: "Follow The Herd: Most popular product of the month",
          type: "boolean",
          ownerType: "PRODUCT",
        },
      },
    },
  );

  const data = await response.json();

  if (data.data?.metafieldDefinitionCreate?.userErrors?.length > 0) {
    throw new Error(
      `Failed to create metafield: ${JSON.stringify(data.data.metafieldDefinitionCreate.userErrors)}`,
    );
  }

  return data.data?.metafieldDefinitionCreate?.createdDefinition;
}

// Set the "Most Popular Monthly" metafield value on a product
export async function setMostPopularMonthlyMetafield(
  admin: any,
  productId: BigInt,
  value: boolean,
): Promise<void> {
  const response = await admin.graphql(
    `
    #graphql
    mutation SetProductMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        metafields: [
          {
            ownerId: `gid://shopify/Product/${productId}`,
            namespace: "custom",
            key: "most_popular_monthly",
            value: value.toString(),
            type: "boolean",
          },
        ],
      },
    },
  );

  const data = await response.json();

  if (data.data?.metafieldsSet?.userErrors?.length > 0) {
    throw new Error(
      `Failed to set metafield: ${JSON.stringify(data.data.metafieldsSet.userErrors)}`,
    );
  }
}

// Clear the "Most Popular Monthly" metafield from the previous most popular product
export async function clearPreviousMostPopularMetafield(
  admin: any,
  previousProductId: BigInt,
): Promise<void> {
  if (previousProductId) {
    await setMostPopularMonthlyMetafield(admin, previousProductId, false);
  }
}
