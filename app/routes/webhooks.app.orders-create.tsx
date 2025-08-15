import { authenticate } from "../shopify.server";

export const action = async ({ request }: { request: Request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  return new Response();
};
