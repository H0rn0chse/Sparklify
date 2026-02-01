import { startServer } from "@h0rn0chse/socket-server";
import fs from "fs";

const json = fs.readFileSync("./gh-pages-dependencies.json", "utf-8");
const dependencies: string[][] = JSON.parse(json);

startServer({
  publicPaths: dependencies,
});
