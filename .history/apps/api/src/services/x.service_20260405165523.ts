import { TwitterApi } from "twitter-api-v2";

export function getXClient(accessToken: string) {
  return new TwitterApi(accessToken);
}

export async function publishTweet(accessToken: string, text: string) {
  const client = getXClient(accessToken);
  const result = await client.v2.tweet(text);
  return result;
}