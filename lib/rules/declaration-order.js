import {DEFAULT_SECTION_ORDER, DEFAULT_LIFECYCLE_ORDER, ERROR_MESSAGE} from "../constants.js"
import { createNodeWithSection, sortNodes, groupNodes, generateSortedText } from "../utils/orderUtils.js"
import { validateSectionOrder } from "../utils/astUtils.js"

export default {
  meta: {
    type: "layout",
    docs: {
      description: `Forces declaration order in Vue 3 <script setup>`,
      category: "Stylistic Issues",
      recommended: true,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          sectionOrder: {
            type: "array",
            items: { type: "string" },
          },
          lifecycleOrder: {
            type: "object",
            additionalProperties: { type: "number" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const sectionOrder = options.sectionOrder || DEFAULT_SECTION_ORDER;
    const lifecycleOrder = options.lifecycleOrder || DEFAULT_LIFECYCLE_ORDER;

    validateSectionOrder(sectionOrder);

    return {
      "Program:exit"(node) {
        const sourceCode = context.getSourceCode();

        // ImportDeclaration은 제외합니다.
        const nonImportNodes = node.body.filter(
          (child) => child.type !== "ImportDeclaration",
        );
        if (nonImportNodes.length === 0) return;

        const nodesWithSection = nonImportNodes.map((child, index) =>
          createNodeWithSection({
            node: child,
            index,
            sourceCode,
            sectionOrder,
            lifecycleOrder,
          }),
        );

        const sortedNodes = sortNodes(nodesWithSection);
        const groups = groupNodes(sortedNodes);
        const sortedText = generateSortedText(groups);
        const fixRange = [
          nonImportNodes[0].range[0],
          nonImportNodes[nonImportNodes.length - 1].range[1],
        ];
        const originalText = sourceCode.text.slice(fixRange[0], fixRange[1]);

        if (originalText === sortedText) return;

        context.report({
          node: nonImportNodes[0],
          message:
            ERROR_MESSAGE,
          fix(fixer) {
            return fixer.replaceTextRange(fixRange, sortedText);
          },
        });
      },
    };
  },
};
