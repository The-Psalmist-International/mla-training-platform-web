import assert from "node:assert/strict"
import { test } from "node:test"
import { targetedVendorChunks } from "./vendor-chunks.mts"

const config = targetedVendorChunks().config()
const { output } = config.environments.client.build.rolldownOptions
const groups = output.codeSplitting.groups
const matches = (id) =>
  groups.filter((group) => group.test.test(id)).map((group) => group.name)

test("vendor grouping applies only to the browser build", () => {
  assert.deepEqual(Object.keys(config.environments), ["client"])
  assert.equal(output.strictExecutionOrder, true)
  assert.equal(output.codeSplitting.includeDependenciesRecursively, false)
  assert.ok(groups.every((group) => group.entriesAware))
})

test("vendor package boundaries work with Windows and POSIX paths", () => {
  for (const prefix of ["C:/repo/node_modules/", "C:\\repo\\node_modules\\"]) {
    const separator = prefix.includes("\\") ? "\\" : "/"
    for (const [pkg, expected] of [
      ["react", "vendor-react"],
      ["react-dom", "vendor-react"],
      ["scheduler", "vendor-react"],
      ["@tanstack/react-query", "vendor-tanstack"],
      ["seroval", "vendor-tanstack"],
      ["@apollo/client", "vendor-apollo"],
      ["@apollo/client-integration-tanstack-start", "vendor-apollo"],
      ["graphql", "vendor-apollo"],
      ["rxjs", "vendor-apollo"],
    ]) {
      assert.deepEqual(
        matches(
          prefix + pkg.replaceAll("/", separator) + separator + "index.js"
        ),
        [expected]
      )
    }
  }
})

test("forms, icons, UI, application pages and similarly named packages stay automatic", () => {
  for (const pkg of [
    "formik",
    "yup",
    "@phosphor-icons/react",
    "@base-ui/react",
    "react-fast-compare",
    "graphql-ws",
  ]) {
    assert.deepEqual(matches(`/repo/node_modules/${pkg}/index.js`), [])
  }
  assert.deepEqual(
    matches("/repo/apps/orchestrator/src/pages/SignInPage.tsx"),
    []
  )
  assert.deepEqual(matches("/repo/packages/data/src/clients.ts"), [])
})
