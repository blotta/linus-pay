import { exit } from "process";

export type RunContext = {
  feature: string;
  step: string;
};

interface LogOptions {
  json?: boolean;
}

export function log(
  obj: object | string | boolean,
  title: string | null = null,
  opts: LogOptions = {},
) {
  const { json = false } = opts;

  const l = [];
  if (title) {
    l.push(`[${title}]:`);
  }
  if (json) {
    l.push(JSON.stringify(obj, null, 2));
  } else {
    l.push(obj);
  }
  console.log(...l);
}

interface CheckOptions {
  json?: boolean;
  shouldError?: boolean;
}

export function check(
  ctx: RunContext,
  data: object | string | boolean,
  error: string | null,
  opts: CheckOptions = {},
) {
  const { shouldError = false } = opts;

  if (!shouldError && error) {
    log(error, `${ctx.feature}:${ctx.step}:ERROR`);
    exit();
  }
  log(data, `${ctx.feature}:${ctx.step}:OK`, opts);
}
