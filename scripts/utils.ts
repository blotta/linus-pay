import { exit } from "process";
import { RunContext } from "./groupSplit/api";

export function log(
  obj: object | string,
  title: string | null = null,
  opts: { json: boolean } = { json: false },
) {
  const l = [];
  if (title) {
    l.push(`[${title}]:`);
  }
  if (opts.json) {
    l.push(JSON.stringify(obj, null, 2));
  } else {
    l.push(obj);
  }
  console.log(...l);
}

export function check(
  ctx: RunContext,
  data: object | string,
  error: string,
  opts: { json: boolean } = { json: false },
) {
  if (error) {
    log(error, `${ctx.feature}:${ctx.step}:ERROR`);
    exit();
  }
  log(data, `${ctx.feature}:${ctx.step}:OK`, opts);
}
