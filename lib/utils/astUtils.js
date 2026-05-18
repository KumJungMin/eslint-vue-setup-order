import {
  DEFAULT_SECTION_ORDER,
  DECLARE_LIST,
  LIFECYCLE_LIST,
} from "../constants.js";

/**
 * @param {ASTNode} node
 * @returns {ASTNode}
 * @description
 * TSAsExpression 또는 TSTypeAssertion 노드를 풀어서 내부 표현식 노드를 반환합니다.
 */
export function unwrapTypeCast(node) {
  const isTSNode = (n) =>
    n.type === "TSAsExpression" || n.type === "TSTypeAssertion";

  while (node && isTSNode(node)) {
    node = node.expression;
  }
  return node;
}

/**
 * @param {ASTNode} node
 * @returns {string}
 * @description
 * AST 노드를 분석하여 해당 노드가 속하는 섹션(그룹)을 반환합니다.
 * ImportDeclaration은 제외하며, 조건에 맞는 섹션이 없으면 "unknowns"를 반환합니다.
 */
export function getSection(node, composableAliases = new Set()) {
  switch (node.type) {
    case "ImportDeclaration":
      return null;
    case "ClassDeclaration":
      return "class";
    case "TSTypeAliasDeclaration":
    case "TSInterfaceDeclaration":
    case "TSEnumDeclaration":
      return "type";
    case "VariableDeclaration":
      return getVariableDeclarationSection(node, composableAliases);
    case "FunctionDeclaration":
      return "functions";
    case "ExpressionStatement":
      if (isCallExpression(node.expression)) {
        const section = getCallExpressionSection(node.expression.callee.name, composableAliases);
        if (section) return section;
      }
      return "unknowns";
    default:
      return "unknowns";
  }
}

function getVariableDeclarationSection(node, composableAliases) {
  const declaration = node.declarations[0];

  if (declaration && declaration.init) {
    const initNode = unwrapTypeCast(declaration.init);

    if (
      initNode.type === "FunctionExpression" ||
      initNode.type === "ArrowFunctionExpression"
    ) {
      return "functions";
    } else if (isCallExpression(initNode)) {
      const section = getCallExpressionSection(initNode.callee.name, composableAliases);

      if (section) return section;
    }
  }

  return "plainVars";
}

/**
 * @param {string} calleeName
 * @returns {string|null}
 * @description
 * CallExpression의 callee 이름에 따라 해당 섹션을 반환합니다.
 */
export function getCallExpressionSection(calleeName, composableAliases = new Set()) {
  if (calleeName === "defineProps") return "defineProps";
  if (calleeName === "defineEmits") return "defineEmits";
  if (calleeName === "defineExpose") return "defineExpose";
  if (calleeName === "defineSlots") return "defineSlots";
  if (calleeName === "defineModel") return "defineModel";
  if (calleeName === "defineOptions") return "defineOptions";
  if (DECLARE_LIST.includes(calleeName)) return "reactiveVars";
  if (calleeName.startsWith("use") || composableAliases.has(calleeName)) return "composables";
  if (calleeName === "computed") return "computed";
  if (calleeName === "watch") return "watchers";
  if (LIFECYCLE_LIST.includes(calleeName)) return "lifecycle";

  return null;
}


/**
 * @param {ASTNode} node
 * @returns {string|null}
 * @description
 * lifecycle 섹션에 해당하는 노드에서 호출된 훅 이름을 추출합니다.
 */
export function extractLifecycleHookName(node) {
  if (node.type === "VariableDeclaration") {
    const declaration = node.declarations[0];

    if (declaration && declaration.init) {
      const initNode = unwrapTypeCast(declaration.init);

      return isCallExpression(initNode) ? initNode.callee.name : null;
    }
  } else if (node.type === "ExpressionStatement") {
    return isCallExpression(node.expression)
      ? node.expression.callee.name
      : null;
  } else {
    return null;
  }
}

function isCallExpression(expression) {
  return (
    expression.type === "CallExpression" &&
    expression.callee.type === "Identifier"
  );
}

/**
 * @param {Array} sectionOrder
 * @description 사용자가 전달한 sectionOrder 값이 유효한지 검사합니다.
 * @throws {Error} sectionOrder가 유효하지 않으면 예외를 발생시킵니다.
 */
export function validateSectionOrder(sectionOrder) {
  if (!Array.isArray(sectionOrder)) {
    throw new Error(
      `Invalid "sectionOrder" option: Expected an array, but received ${typeof sectionOrder}.`,
    );
  }

  for (const section of sectionOrder) {
    if (typeof section !== "string") {
      throw new Error(
        `Invalid "sectionOrder" option: Expected string values, but found ${typeof section}.`,
      );
    }
    if (!DEFAULT_SECTION_ORDER.includes(section)) {
      throw new Error(
        `Invalid "sectionOrder" option: "${section}" is not a recognized section. Valid sections: ${DEFAULT_SECTION_ORDER.join(
          ", ",
        )}`,
      );
    }
  }
}

/**
 * @param {string} section
 * @returns {string}
 * @description
 * 섹션 이름을 그룹 이름으로 변환합니다.
 * define* 관련 항목은 하나의 그룹("define")으로 합칩니다.
 */
export function groupName(section) {
  const defineGroup = ["defineProps", "defineEmits"];
  return defineGroup.includes(section) ? "define" : section;
}
