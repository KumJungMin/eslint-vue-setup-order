import { DEFAULT_SECTION_ORDER, DEFAULT_LIFECYCLE_ORDER } from "../constants.js"
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
      /** @param {import('vue-eslint-parser').AST.Node} node */
      "Program:exit"(node) {
        /** @type {import('eslint').SourceCode} */
        const sourceCode = context.getSourceCode();

        /** @type {import("vue-eslint-parser").AST.VDocumentFragment} */
        const document = context.sourceCode.parserServices.getDocumentFragment();
        const setupScripts = document.children.filter(
            (child) => child.type === "VElement" && child.name === "script" && child.startTag.attributes.find(attr => attr.key.name.toLowerCase() === 'setup')
        );

        const nodes = node.body
            .filter(
              (child) => child.type !== "ImportDeclaration",
            )
            .filter(node => {
              const [start, end] = node.range;
              return setupScripts.some(({range: [scriptStart, scriptEnd]}) => start >= scriptStart && end <= scriptEnd);
            });
            
      if (nodes.length === 0) return;          

        const nodesWithSection = nodes.map((child, index) =>
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
          nodes[0].range[0],
          nodes[nodes.length - 1].range[1],
        ];
        const originalText = sourceCode.text.slice(fixRange[0], fixRange[1]);

        if (originalText === sortedText) return;

        context.report({
          node: nodes[0],
          message:
            "Vue 3 <script setup> declarations are not correctly sorted, run eslint with --fix to automatically fix this.",
          fix(fixer) {
            return fixer.replaceTextRange(fixRange, sortedText);
          },
        });
      },
    };
  },
};
