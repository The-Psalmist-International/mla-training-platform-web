import { fileURLToPath } from "node:url"
import type { CodegenConfig } from "@graphql-codegen/cli"

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/")

const config: CodegenConfig = {
  schema: fromRoot("../mla-platform-core/schema.graphql"),
  documents: fromRoot("packages/data/apollo/**/query.graphql"),
  generates: {
    [fromRoot("packages/data/src/generated/graphql.ts")]: {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: true,
        scalars: { ID: { input: "string", output: "string" } },
        avoidOptionals: { field: true, inputValue: false },
        documentNodeImport: "@apollo/client#TypedDocumentNode",
      },
    },
  },
}

export default config
