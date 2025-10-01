// Local ESLint plugin: cypress-cleanup
// Rule: require-after-with-before
// Ensures that when a Cypress/Mocha `before(() => { ... })` hook is used in a test file,
// there is also an `after(() => { ... })` hook for proper cleanup.
//
// Rule: enforce-page-singleton
// For non-abstract classes whose name ends with "Page" and which have a zero-argument (or missing) constructor,
// require a field exactly: `public static readonly INSTANCE = new ClassName();`.
//
// Standard ESLint suppression comments work to disable these rules where needed, e.g.:
//   /* eslint-disable cypress-cleanup/require-after-with-before */
//   /* eslint-disable cypress-cleanup/enforce-page-singleton */
//   // eslint-next-line cypress-cleanup/require-after-with-before
//   // eslint-next-line cypress-cleanup/enforce-page-singleton
//
/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
  meta: {
    name: "cypress-cleanup",
    version: "1.1.0"
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
    },

    // New rule: require clear() immediately before type() in Cypress chains
    "require-clear-before-type": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Require that Cypress .type(...) is immediately preceded by .clear() in the same chain (e.g., clear().type('text')).",
          recommended: false
        },
        schema: [],
        messages: {
          mustClearBeforeType:
            "Use clear() immediately before type(...). Example: cy.get(...).clear().type('text')."
        }
      },
      create(context) {
        function isMemberCallWithName(node, name) {
          return (
            node &&
            node.type === "CallExpression" &&
            node.callee &&
            node.callee.type === "MemberExpression" &&
            !node.callee.computed &&
            node.callee.property &&
            node.callee.property.type === "Identifier" &&
            node.callee.property.name === name
          );
        }

        return {
          CallExpression(node) {
            // Only consider member calls `.type(...)`
            if (!isMemberCallWithName(node, "type")) return;

            const objectExpr = node.callee.object;
            // Must be a call like `something.clear()` directly before
            if (isMemberCallWithName(objectExpr, "clear")) {
              return; // valid
            }

            // Otherwise, report
            context.report({
              node,
              messageId: "mustClearBeforeType"
            });
          }
        };
      }
    }

  }
};

export default plugin;
