// Local ESLint plugin: page-rules
// Rule: enforce-page-singleton
// For non-abstract classes whose name ends with "Page" and which have a zero-argument (or missing) constructor,
// require a field exactly: `public static readonly INSTANCE = new ClassName();`.

/** @type {import("eslint").ESLint.Plugin} */
const plugin = {
  meta: {
    name: "page-rules",
    version: "1.0.0"
  },
  rules: {
    "enforce-page-singleton": {
      meta: {
        type: "problem",
        docs: {
          description:
            "For non-abstract classes ending with 'Page' that have a zero-arg (or missing) constructor, require a public static readonly INSTANCE initialized with `new ClassName()`.",
          recommended: false
        },
        schema: [],
        messages: {
          missingInstance:
            "Class '{{className}}' must declare: public static readonly INSTANCE = new {{className}}();"
        }
      },
      create(context) {
        function classEndsWithPage(node) {
          return (
            node &&
            node.type === "ClassDeclaration" &&
            node.id &&
            node.id.type === "Identifier" &&
            /Page$/.test(node.id.name)
          );
        }

        function isAbstract(node) {
          // typescript-eslint adds `abstract: true` on ClassDeclaration when 'abstract' is present
          return Boolean(node && node.abstract);
        }

        function getConstructor(node) {
          if (!node || !node.body || !node.body.body) return null;
          return node.body.body.find(
            (m) => m.type === "MethodDefinition" && m.kind === "constructor"
          );
        }

        function hasZeroArgConstructorOrNone(node) {
          const ctor = getConstructor(node);
          if (!ctor) return true; // missing constructor implies zero-arg default
          const fn = ctor.value;
          const params = (fn && fn.params) || [];
          return params.length === 0;
        }

        function hasRequiredInstanceField(node) {
          const className = node.id.name;
          const members = (node.body && node.body.body) || [];
          for (const m of members) {
            if (
              (m.type === "PropertyDefinition" || m.type === "ClassProperty") &&
              m.static === true &&
              m.key && m.key.type === "Identifier" && m.key.name === "INSTANCE"
            ) {
              // Check readonly/public when present (TS adds these flags)
              const isReadonly = m.readonly === true;
              const isPublic = m.accessibility ? m.accessibility === "public" : false;

              const v = m.value || m.initializer; // older ASTs may use initializer
              const isCorrectInit =
                v &&
                v.type === "NewExpression" &&
                v.callee &&
                v.callee.type === "Identifier" &&
                v.callee.name === className &&
                ((v.arguments || []).length === 0);

              if (isReadonly && isPublic && isCorrectInit) {
                return true;
              }
            }
          }
          return false;
        }

        return {
          ClassDeclaration(node) {
            if (!classEndsWithPage(node)) return;
            if (isAbstract(node)) return;
            if (!hasZeroArgConstructorOrNone(node)) return;

            if (!hasRequiredInstanceField(node)) {
              context.report({
                node,
                messageId: "missingInstance",
                data: { className: node.id.name }
              });
            }
          }
        };
      }
    }
  }
};

export default plugin;
