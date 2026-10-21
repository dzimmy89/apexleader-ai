import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PROD_FIRESTORE_PROJECT,
  assertOperatorProject,
  parseCredentialsProjectId,
} from "../lib/crm/operator-project-guard";

describe("operator project guard", () => {
  it("reads project_id from credentials JSON", () => {
    assert.equal(
      parseCredentialsProjectId(
        JSON.stringify({ type: "service_account", project_id: "defi-university-prod" })
      ),
      "defi-university-prod"
    );
  });

  it("refuses --project that does not match credentials project_id", () => {
    assert.throws(
      () =>
        assertOperatorProject({
          credentialProjectId: "defi-university-prod",
          projectFlag: "some-other-project",
        }),
      /does not match credentials project_id/
    );
  });

  it("refuses credentials that do not match the expected project", () => {
    assert.throws(
      () =>
        assertOperatorProject({
          credentialProjectId: "personal-sandbox",
          expectedProject: PROD_FIRESTORE_PROJECT,
        }),
      /does not match expected project/
    );
  });

  it("refuses the emulator when the target is prod", () => {
    assert.throws(
      () =>
        assertOperatorProject({
          credentialProjectId: PROD_FIRESTORE_PROJECT,
          projectFlag: PROD_FIRESTORE_PROJECT,
          emulatorHost: "127.0.0.1:8080",
        }),
      /FIRESTORE_EMULATOR_HOST is set/
    );
  });

  it("accepts matching --project and credentials without an emulator", () => {
    assert.equal(
      assertOperatorProject({
        credentialProjectId: PROD_FIRESTORE_PROJECT,
        projectFlag: PROD_FIRESTORE_PROJECT,
        emulatorHost: "",
      }),
      PROD_FIRESTORE_PROJECT
    );
  });

  it("allows the emulator when the target is not prod", () => {
    assert.equal(
      assertOperatorProject({
        credentialProjectId: "demo-defi-university-rules",
        expectedProject: "demo-defi-university-rules",
        emulatorHost: "127.0.0.1:8080",
      }),
      "demo-defi-university-rules"
    );
  });
});
