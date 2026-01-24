import { RunContext } from "../../utils";
import { entrySplitValidation } from "./features/entry-split";

const runContext: RunContext = {
  feature: "",
  step: "",
};

type FeatureFn = (ctx: RunContext) => Promise<void>;

const features: { feature: string; fn: FeatureFn }[] = [
  { feature: "SplitValidation", fn: entrySplitValidation },
];

for (const f of features) {
  runContext.feature = f.feature;
  await f.fn(runContext);
}
