// Local ESLint plugin: cypress-cleanup
// Rule: require-after-with-before
// Ensures that when a Cypress/Mocha `before(() => { ... })` hook is used in a test file,
// there is also an `after(() => { ... })` hook for proper cleanup.
//
// Standard ESLint suppression comments work to disable this rule where needed, e.g.:
//   /* eslint-disable cypress-cleanup/require-after-with-before */
//   // eslint-disable-next-line cypress-cleanup/require-after-with-before
//
/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
  meta: {
    name: "cypress-cleanup",
    version: "1.0.0"
  },
  rules: {
    "require-after-with-before": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Require an `after(() => { ... })` hook whenever `before(() => { ... })` is used in a Cypress/Mocha test file.",
          recommended: false
        },
        schema: [],
        messages: {
          missingAfter:
            "Found a 'before(...)' function but no 'after(...)' function within current file. Add 'after(() => { ... })' or disable a rule."
        }
      },
      create(context) {
        let beforeNodes = [];
        let afterFound = false;

        function isHookCall(node, name) {
          return (
            node &&
            node.type === "CallExpression" &&
            node.callee &&
            node.callee.type === "Identifier" &&
            node.callee.name === name
          );
        }

        function hasFunctionCallback(node) {
          if (!node.arguments || node.arguments.length === 0) return false;
          const first = node.arguments[0];
          return (
            first.type === "FunctionExpression" ||
            first.type === "ArrowFunctionExpression"
          );
        }

        return {
          CallExpression(node) {
            if (isHookCall(node, "before") && hasFunctionCallback(node)) {
              beforeNodes.push(node);
            }
            if (isHookCall(node, "after") && hasFunctionCallback(node)) {
              afterFound = true;
            }
          },
          "Program:exit"() {
            if (beforeNodes.length > 0 && !afterFound) {
              context.report({
                node: beforeNodes[0],
                messageId: "missingAfter"
              });
            }
          }
        };
      }
    }
  }
};

export default plugin;
