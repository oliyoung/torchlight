import { PubSub } from 'graphql-subscriptions';

// Create a singleton PubSub instance that can be imported throughout the app
const pubsub = new PubSub();

export { pubsub };