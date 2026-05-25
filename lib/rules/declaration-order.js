import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_LIFECYCLE_ORDER,
  ERROR_MESSAGE
} from "../constants.js";
import {
  createNodeWithSection,
  sortNodes,
  groupNodes,
  generateSortedText,
  attachPreservedItemSeparators,
} from "../utils/orderUtils.js";
import { validateSectionOrder } from "../utils/astUtils.js";

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
          composableAliases: {
            type: "array",
            items: { type: "string" },
          },
          spaceBetweenItems: {
            anyOf: [
              { type: "boolean" },
              { enum: ["never", "always", "preserve"] },
            ],
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
    const composableAliases = new Set(options.composableAliases || []);
    const spaceBetweenItems = options.spaceBetweenItems ?? false;
    validateSectionOrder(sectionOrder);
    return {
      /** @param {import('vue-eslint-parser').AST.Node} node */
      "Program:exit"(node) {
        /** @type {import('eslint').SourceCode} */
        const sourceCode = context.getSourceCode();

        /** @type {import("vue-eslint-parser").AST.VDocumentFragment} */
        const document =
          context.sourceCode.parserServices.getDocumentFragment();
        const setupScripts = document.children.filter(
          (child) =>
            child.type === "VElement" &&
            child.name === "script" &&
            child.startTag.attributes.find(
              (attr) => attr.key.name.toLowerCase() === "setup",
            ),
        );

        const nodes = node.body
          .filter((child) => child.type !== "ImportDeclaration")
          .filter((node) => {
            const [start, end] = node.range;
            return setupScripts.some(
              ({ range: [scriptStart, scriptEnd] }) =>
                start >= scriptStart && end <= scriptEnd,
            );
          });

        if (nodes.length === 0) return;

        const nodesWithSection = nodes.map((child, index) =>
          createNodeWithSection({
            node: child,
            index,
            sourceCode,
            sectionOrder,
            lifecycleOrder,
            composableAliases,
          }),
        );
        attachPreservedItemSeparators(nodesWithSection, sourceCode);

        const sortedNodes = sortNodes(nodesWithSection);
        const groups = groupNodes(sortedNodes);
        const sortedText = generateSortedText(groups, { spaceBetweenItems });
        const firstNodeComments = (sourceCode.getCommentsBefore ? sourceCode.getCommentsBefore(nodes[0]) : [])
          .filter((c) => {
            const lineStart = sourceCode.text.lastIndexOf("\n", c.range[0] - 1) + 1;
            return sourceCode.text.slice(lineStart, c.range[0]).trim() === "";
          });
        const fixStart = firstNodeComments.length > 0 ? firstNodeComments[0].range[0] : nodes[0].range[0];
        const lastNode = nodes[nodes.length - 1];
        const lastNodeInlineComments = (sourceCode.getCommentsAfter ? sourceCode.getCommentsAfter(lastNode) : [])
          .filter((c) => c.loc.start.line === lastNode.loc.end.line);
        const fixEnd = lastNodeInlineComments.length > 0
          ? lastNodeInlineComments[lastNodeInlineComments.length - 1].range[1]
          : lastNode.range[1];
        const fixRange = [fixStart, fixEnd];
        const originalText = sourceCode.text.slice(fixRange[0], fixRange[1]);

        function normalizeLineEndings(str) {
          return str.replace(/\r\n/g, '\n');
        }
        
        if (normalizeLineEndings(originalText) === normalizeLineEndings(sortedText)) return;

        context.report({
          node: nodes[0],
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
