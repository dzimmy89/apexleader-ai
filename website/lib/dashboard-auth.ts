import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Who may read the dashboard summary: the "Dashboard collect" workflow on the
 * main branch of the GTM repository, and nobody else.
 *
 * GitHub signs a short-lived identity token for every workflow run. This
 * checks GitHub's signature, that the token was issued for this endpoint, and
 * which repository and branch the run belongs to. There is no shared secret
 * to create, store or rotate, and nothing to set on Cloud Run.
 */
export const GITHUB_ACTIONS_ISSUER = "https://token.actions.githubusercontent.com";
export const DASHBOARD_AUDIENCE = "agency-dashboard-summary";
/** dzimmy89/defi-university-gtm. The id is checked, not the name: a name can be re-registered. */
export const DASHBOARD_CALLER_REPOSITORY_ID = "1423403779";
export const DASHBOARD_CALLER_REF = "refs/heads/main";

type KeySource = Parameters<typeof jwtVerify>[1];

let githubKeys: KeySource | undefined;

/** `keys` is for tests; in production GitHub's published signing keys are used. */
export async function verifyDashboardCaller(request: Request, keys?: KeySource): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7).trim();
  if (!token) return false;
  try {
    const keySource =
      keys ?? (githubKeys ??= createRemoteJWKSet(new URL(`${GITHUB_ACTIONS_ISSUER}/.well-known/jwks`)));
    const { payload } = await jwtVerify(token, keySource, {
      issuer: GITHUB_ACTIONS_ISSUER,
      audience: DASHBOARD_AUDIENCE,
      algorithms: ["RS256"],
    });
    return (
      payload.repository_id === DASHBOARD_CALLER_REPOSITORY_ID && payload.ref === DASHBOARD_CALLER_REF
    );
  } catch {
    return false;
  }
}
