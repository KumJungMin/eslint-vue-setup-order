import { getSection, extractLifecycleHookName, groupName } from "./astUtils.js"

/**
 * @param {object} params - { node, index, sourceCode, sectionOrder, lifecycleOrder }
 * @returns {object} { node, index, section, sortIndex, text, lifecycleSortIndex }
 * @description
 * 각 노드별로 섹션과 정렬 인덱스를 생성합니다.
 * 사용자가 전달한 sectionOrder 배열에 해당 섹션이 존재하면 그 인덱스를 사용하고,
 * 존재하지 않으면 sectionOrder.length (즉, 하단에 배치)로 지정합니다.
 * lifecycle 섹션인 경우, 추가로 lifecycleSortIndex를 부여합니다.
 */
export function createNodeWithSection({
  node,
  index,
  sourceCode,
  sectionOrder,
  lifecycleOrder,
  composableAliases,
}) {
  const section = getSection(node, composableAliases);
  const text = sourceCode.getText(node);
  const idx = sectionOrder.indexOf(section);
  const sortIndex = idx !== -1 ? idx : sectionOrder.length;
  const lifecycleSortIndex = section === "lifecycle" ? getLifecycleSortIndex(node, lifecycleOrder) : null;
  const KEEP_MARKER = "eslint-vue-setup-order:keep";
  const leadingComments = sourceCode.getCommentsBefore ? sourceCode.getCommentsBefore(node) : [];
  const trailingComments = sourceCode.getCommentsAfter ? sourceCode.getCommentsAfter(node) : [];
  // Inline trailing comments = on the same line as the node's last token.
  const inlineTrailingComments = trailingComments.filter(
    (c) => c.loc.start.line === node.loc.end.line
  );
  // A "true" leading comment starts on its own line (no code before it on the same line).
  // This excludes inline comments that belong to the previous statement but are also
  // returned by getCommentsBefore() of the next node.
  const trueLeadingComments = leadingComments.filter((c) => {
    const lineStart = sourceCode.text.lastIndexOf("\n", c.range[0] - 1) + 1;
    return sourceCode.text.slice(lineStart, c.range[0]).trim() === "";
  });
  // A leading comment pins the node only when directly adjacent (no blank line between).
  const pinnedByLeading = trueLeadingComments.some(
    (c) => c.value.includes(KEEP_MARKER) && c.loc.end.line + 1 === node.loc.start.line
  );
  // An inline trailing comment always pins the node it sits on.
  const pinnedByInline = inlineTrailingComments.some((c) => c.value.includes(KEEP_MARKER));
  const pinned = pinnedByLeading || pinnedByInline;
  // Capture the raw text of true leading comments so they travel with the node.
  const leadingCommentText = trueLeadingComments.length > 0
    ? sourceCode.text.slice(trueLeadingComments[0].range[0], node.range[0])
    : "";
  // Capture the inline trailing comment text so it travels with the node.
  const trailingInlineText = inlineTrailingComments.length > 0
    ? sourceCode.text.slice(node.range[1], inlineTrailingComments[inlineTrailingComments.length - 1].range[1])
    : "";
  const textStart = trueLeadingComments.length > 0 ? trueLeadingComments[0].range[0] : node.range[0];
  const textEnd = inlineTrailingComments.length > 0
    ? inlineTrailingComments[inlineTrailingComments.length - 1].range[1]
    : node.range[1];
  return {
    node,
    index,
    section,
    sortIndex,
    text,
    lifecycleSortIndex,
    pinned,
    leadingCommentText,
    trailingInlineText,
    textRange: [textStart, textEnd],
  };
}

function getLifecycleSortIndex(node, lifecycleOrder) {
  const hookName = extractLifecycleHookName(node);
  const hasHookName = hookName && lifecycleOrder.hasOwnProperty(hookName);

  return hasHookName ? lifecycleOrder[hookName] : Object.keys(lifecycleOrder).length;
}

/**
 * @param {Array} nodesWithSection - 각 항목은 { node, index, section, sortIndex, text, lifecycleSortIndex, pinned } 구조입니다.
 * @returns {Array}
 * @description
 * 전체 노드를 sectionOrder에 따른 순서로 정렬합니다.
 * 같은 섹션 내에서는 원래 순서를 유지하되, lifecycle 그룹은 추가로 lifecycleSortIndex로 정렬합니다.
 */
export function sortNodes(nodesWithSection) {
  const n = nodesWithSection.length;
  const result = new Array(n);

  // Place pinned nodes at their original positions
  const pinnedIndexes = new Set();
  nodesWithSection.forEach((item) => {
    if (item.pinned) {
      result[item.index] = item;
      pinnedIndexes.add(item.index);
    }
  });

  // Sort non-pinned nodes
  const nonPinned = nodesWithSection.filter((item) => !item.pinned);
  const sortedNonPinned = nonPinned.slice().sort((a, b) => {
    if (a.sortIndex !== b.sortIndex) return a.sortIndex - b.sortIndex;
    if (a.section === "lifecycle" && b.section === "lifecycle") {
      const aL = typeof a.lifecycleSortIndex === "number" ? a.lifecycleSortIndex : Infinity;
      const bL = typeof b.lifecycleSortIndex === "number" ? b.lifecycleSortIndex : Infinity;
      if (aL !== bL) return aL - bL;
    }
    return a.index - b.index;
  });

  // Fill free positions with sorted non-pinned nodes
  const freePositions = Array.from({ length: n }, (_, i) => i).filter((i) => !pinnedIndexes.has(i));
  freePositions.forEach((pos, i) => {
    result[pos] = sortedNonPinned[i];
  });

  return result;
}

/**
 * @param {Array} sortedNodes
 * @returns {Array}
 * @description
 * 정렬된 노드들을 그룹별로 묶습니다. (define* 관련 항목은 하나의 그룹으로 합쳐짐)
 */
export function groupNodes(sortedNodes) {
  if (sortedNodes.length === 0) return [];

  const groups = [];
  let currentGroup = [sortedNodes[0]];
  let currentGroupName = groupName(sortedNodes[0].section);

  for (let i = 1; i < sortedNodes.length; i++) {
    const item = sortedNodes[i];
    const itemGroupName = groupName(item.section);
    const isSameGroup = itemGroupName === currentGroupName;

    if (isSameGroup) {
      currentGroup.push(item);
    } else {
      groups.push({ group: currentGroupName, items: currentGroup });
      currentGroup = [item];
      currentGroupName = itemGroupName;
    }
  }
  groups.push({
    group: currentGroupName,
    items: currentGroup,
  });

  return groups;
}

export function attachPreservedItemSeparators(items, sourceCode) {
  for (let i = 0; i < items.length - 1; i++) {
    const current = items[i];
    const next = items[i + 1];

    if (groupName(current.section) !== groupName(next.section)) continue;

    current.preservedSeparatorAfter = sourceCode.text.slice(current.textRange[1], next.textRange[0]);
  }
}

/**
 * @param {Array} groups
 * @returns {string}
 * @description
 * 각 그룹 내 노드들은 "\n"으로 연결하고, 그룹 간에는 "\n\n"을 삽입한 최종 텍스트를 생성합니다.
 */
export function generateSortedText(groups, options = {}) {
  const spacingMode = getSpaceBetweenItemsMode(options.spaceBetweenItems);
  const itemSeparator = spacingMode === "always" ? "\n\n" : "\n";

  function getItemSeparator(previous, next) {
    if (spacingMode !== "preserve") return itemSeparator;

    if (previous.index + 1 === next.index && previous.preservedSeparatorAfter !== undefined) {
      return previous.preservedSeparatorAfter;
    }

    if (next.index + 1 === previous.index && next.preservedSeparatorAfter !== undefined) {
      return next.preservedSeparatorAfter;
    }

    return "\n";
  }

  function getGroupText(group) {
    return group.items.reduce((text, item, index) => {
      const nodeText = normalizeNewlines(item.text);
      const withLeading = item.leadingCommentText ? item.leadingCommentText + nodeText : nodeText;
      const itemText = item.trailingInlineText ? withLeading + item.trailingInlineText : withLeading;

      if (index === 0) return itemText;

      return text + getItemSeparator(group.items[index - 1], item) + itemText;
    }, "");
  }
  return groups.map(getGroupText).join("\n\n");
}

function getSpaceBetweenItemsMode(spaceBetweenItems) {
  if (spaceBetweenItems === true || spaceBetweenItems === "always") return "always";
  if (spaceBetweenItems === "preserve") return "preserve";
  return "never";
}

export function normalizeNewlines(text) {
  return text.trim();
}
