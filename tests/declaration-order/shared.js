import { RuleTester } from "eslint";
import rule from "../../lib/rules/declaration-order.js";
import config from "../config.js";
import { ERROR_MESSAGE } from "../../lib/constants.js";

export const ruleTester = new RuleTester(config);
export { rule, ERROR_MESSAGE };
