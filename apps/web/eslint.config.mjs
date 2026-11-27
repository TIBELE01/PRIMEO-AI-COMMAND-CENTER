import { primeoRules } from "@primeo/eslint-config/base";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  { ignores: [".next/**", "next-env.d.ts"] },
  ...nextVitals,
  ...nextTypescript,
  primeoRules,
];
