import { exit } from "node:process";

export function log(obj: Subject, title: string | null = null) {
  if (title) {
    process.stdout.write(`[${title}]: `);
  }

  console.dir(obj, { depth: 10, colors: true });
}

type Subject = string | boolean | object | null | undefined;

type ValidationResult =
  | { data: Subject; error: null }
  | { data: null; error: string | boolean | object };

type ValidationResultSet = [string, ValidationResult | boolean];

type ValidationFn<T> = (
  data: T,
) =>
  | ValidationResult
  | Promise<ValidationResult>
  | boolean
  | Promise<boolean>
  | ValidationResultSet[]
  | Promise<ValidationResultSet[]>;

type ValidationFnSet<T> = [string, ValidationFn<T>];

export const Val = {
  ok: (data: Subject): ValidationResult => {
    return { data: data, error: null };
  },
  error: (msg: string): ValidationResult => {
    return { data: null, error: msg };
  },
  isDefined: (data: Subject): ValidationResult => {
    return data ? Val.ok(data) : Val.error("subject is not defined");
  },
  isNull: (data: Subject): ValidationResult => {
    return data == null ? Val.ok(data) : Val.error("subject is not null");
  },
  true: (data: boolean): ValidationResult => {
    return data === true ? Val.ok("true") : Val.error("false");
  },
};

export async function check<TData>(
  desc: string,
  subject: TData,
  ...validations: ValidationFnSet<TData>[]
) {
  const valResults: ValidationResultSet[] = [];

  for (const [validateKey, validateFn] of validations) {
    const title = `${desc}:${validateKey}`;
    const validationResult = await validateFn(subject);
    // const results: ValidationResultSet[] = [];
    if (typeof validationResult === "boolean") {
      valResults.push([title, Val.true(validationResult)]);
    } else if (Array.isArray(validationResult)) {
      const set = validationResult as ValidationResultSet[];
      for (const [key, res] of set) {
        const valRes: ValidationResult =
          typeof res === "boolean" ? Val.true(res) : res;
        valResults.push([`${title}:${key}`, valRes]);
        if (valRes.error != null) {
          break;
        }
      }
    } else {
      valResults.push([title, validationResult as ValidationResult]);
    }

    if (valResults.find((r) => (r[1] as ValidationResult).error != null)) {
      break;
    }
  }

  for (const [title, res] of valResults) {
    const valRes = res as ValidationResult;
    if (valRes.error != null) {
      log(valRes.error, title + ":ERROR");
    } else {
      log(valRes.data, title + ":OK");
    }
  }

  if (valResults.find((r) => (r[1] as ValidationResult).error != null)) {
    exit();
  }
}
