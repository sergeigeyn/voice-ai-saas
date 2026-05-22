import PocketBase from "pocketbase";

export const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://tasks-merry-random-season.trycloudflare.com";

export const pb = new PocketBase(PB_URL);
