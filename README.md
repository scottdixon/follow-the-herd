# Follow The Herd - Shopify App

A Shopify app that tracks your most popular products based on real sales data and helps create FOMO (fear of missing out) to boost conversions. When customers see what others are buying, they don't want to miss out!

Built with the [Shopify App Remix Template](https://github.com/Shopify/shopify-app-template-remix).

## What Follow The Herd Does

🐑 **Tracks Real Sales Data**: Automatically monitors order webhooks to track which products are selling and in what quantities.

📊 **Identifies Trending Products**: Analyzes sales data from the last 30 days to determine the most popular products based on total quantities sold.

🏷️ **Sets Metafields**: Automatically applies a special metafield to the #1 most popular product that you can use in your theme.

🎨 **Theme Integration**: Includes a theme app extension block to showcase the most popular product directly in your storefront.

💎 **Admin Dashboard**: Clean interface showing top 10 selling products with the #1 product highlighted.

## Quick start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.


### Local Development

```shell
npm run script setup
shopify app dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

## How It Works

### 1. Order Tracking
When customers place orders, the `orders/create` webhook automatically:
- Extracts product IDs and quantities from line items
- Saves sales data to the database with actual quantities purchased
- Handles multiple quantities of the same product

### 2. Analytics & Rankings
The app analyzes the last 30 days of sales data to:
- Calculate total quantities sold per product (not just unique purchases)
- Rank products by popularity
- Update the most popular product automatically

### 3. Metafield Management
The most popular product gets a special metafield:
- **Namespace**: `follow_the_herd`
- **Key**: `most_popular_monthly`
- **Value**: `true`

Previous most popular products have this metafield cleared automatically.

### 4. Theme Integration
The theme app extension (`extensions/theme-extension/`) provides:
- A customizable block to display the most popular product
- Merchant configuration options for messaging
- Integration with your existing theme design

### 5. Admin Dashboard
Clean interface showing:
- Top 10 selling products (last 30 days)
- #1 product highlighted with crown emoji and "Most Popular" badge
- Total quantities sold for each product
- Product titles fetched from Shopify API

## Key Files

- `/app/routes/webhooks.app.orders-create.tsx` - Processes order webhooks and tracks sales
- `/app/lib/analytics.server.ts` - Handles product ranking calculations
- `/app/lib/metafields.server.ts` - Manages metafield updates for popular products
- `/app/routes/app._index.tsx` - Main dashboard showing product rankings
- `/extensions/theme-extension/` - Theme app extension for storefront display
- `/prisma/schema.prisma` - Database schema for tracking sales and rankings

### Using Prisma

By default this template uses SQLlite as the database. It is recommended to move to a persisted database for production.

## Benefits for Merchants

### 🚀 Increase Conversions
- **Social Proof**: Show customers what others are buying
- **FOMO Effect**: Create urgency when shoppers see trending products
- **Trust Building**: Demonstrate that products are popular and selling well

### 📈 Data-Driven Insights
- **Real Sales Data**: Track actual quantities sold, not just unique purchases
- **Automatic Updates**: Rankings update automatically as new orders come in
- **Historical Tracking**: 30-day rolling window for trending analysis

### 🎨 Easy Theme Integration
- **No Code Required**: Theme app extension integrates with any theme
- **Merchant Customization**: Configure messaging and display options
- **Responsive Design**: Works seamlessly across desktop and mobile

## Technical Features

### Shopify Integration
- **[Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)**: Authentication and Shopify API interactions
- **[Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge)**: Seamless admin integration
- **[Polaris React](https://polaris.shopify.com/)**: Shopify's design system and UI components
- **[Theme App Extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions)**: Storefront integration

### Data Flow
- **Order Webhooks**: Real-time sales tracking via `orders/create` events
- **GraphQL Admin API**: Product data fetching and metafield management
- **Metafields API**: Persistent popular product flags for theme consumption

## Using the Theme App Extension

The theme app extension allows merchants to display the most popular product directly in their storefront without modifying theme code.

### Installation
1. The extension installs automatically when the app is installed
2. Merchants can add the "Most Popular Product" block to any section in their theme editor
3. No coding or theme modifications required

### Configuration Options
Merchants can customize:
- Display message text
- Styling through standard theme controls

### How It Works
The extension automatically:
- Detects which product has the `follow_the_herd.most_popular_monthly` metafield
- Displays that product with customizable messaging
- Updates automatically when the most popular product changes

### Metafield Details
- **Namespace**: `follow_the_herd`
- **Key**: `most_popular_monthly`
- **Type**: `boolean`

## Resources

- [Remix Docs](https://remix.run/docs/en/v1)
- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)
- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
