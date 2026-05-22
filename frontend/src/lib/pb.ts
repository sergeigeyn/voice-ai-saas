import PocketBase from "pocketbase";

const url = process.env.NEXT_PUBLIC_PB_URL;
if (!url) {
  throw new Error("NEXT_PUBLIC_PB_URL is not set");
}
export const pb = new PocketBase(url);
