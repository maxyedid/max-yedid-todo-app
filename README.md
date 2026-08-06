# To-Do App

Static Next.js to-do list (S3 + CloudFront), no backend — items live only in
in-memory React state for the current browser session. Infra is managed
with AWS CDK (TypeScript). Deploys run via GitHub Actions.

**Live at:** https://d2ucclc1t450w.cloudfront.net/

## Project layout

```
app/, components/, lib/   Next.js app (static export)
infra/                     AWS CDK app (S3, CloudFront)
.github/workflows/         CI/CD
```

## One-time setup checklist

### 1. AWS
1. Create an AWS account if you don't have one, and configure credentials
   locally (`aws configure` or `aws login`).
2. Bootstrap CDK once per account/region: `npx cdk bootstrap` (run from `infra/`).
3. Deploy: `cd infra && npm install && npx cdk deploy --all`. This deploys
   both stacks — `TodoSiteStack` (S3 + CloudFront) and `GithubOidcStack`
   (the IAM role GitHub Actions assumes to deploy, see below).
4. Note the `SiteUrl` output — that's your CloudFront URL (e.g.
   `https://dxxxxxxxxxxxxx.cloudfront.net`). There's no custom domain wired
   up; add Route53 + ACM to `infra/lib/site-stack.ts` later if you want one.

### 2. GitHub Actions (CI/CD)
CI authenticates to AWS via GitHub's OIDC provider — no long-lived AWS keys
stored in the repo. `infra/lib/github-oidc-stack.ts` provisions an IAM role
(`github-actions-todo-app-deploy`) that can only be assumed by workflow runs
triggered from a push to `main` in this exact repo, and that role can only
assume the CDK bootstrap roles (not S3/CloudFront/IAM directly).

1. Push this repo to GitHub (must match the repo hardcoded in
   `github-oidc-stack.ts`'s `GITHUB_REPO` constant, or the trust policy
   won't match and the workflow's `sts:AssumeRoleWithWebIdentity` will fail).

   Note the constant is `owner@ownerId/repo@repoId`, not just `owner/repo`.
   Repos created after 2026-07-15 default to GitHub's "immutable subject
   claims," where the OIDC token's `sub` claim embeds the numeric owner/repo
   IDs (e.g. `repo:maxyedid@26383888/max-yedid-todo-app@1324552127:ref:...`)
   instead of the plain names — an older repo would just use `owner/repo`
   here. Get the IDs with:
   ```bash
   gh api repos/<owner>/<repo> --jq '"\(.owner.login)@\(.owner.id)/\(.name)@\(.id)"'
   ```
2. Deploy `GithubOidcStack` if you haven't (`npx cdk deploy GithubOidcStack`,
   from `infra/`) — it must exist before the workflow can run.
3. No repository secrets needed. From then on, pushes to `main` will build
   the static site and run `cdk deploy`, which syncs `out/` to S3 and
   invalidates CloudFront as part of the stack deployment (via
   `BucketDeployment` in `infra/lib/site-stack.ts`).

## Local development

```bash
npm install
npm run dev
```

To preview the actual static export locally (closer to what CloudFront
serves than `next dev`):

```bash
npm run build
npm start          # serves out/ via `serve`, since `next start` doesn't
                    # work with output: "export"
```

## Deploying manually

```bash
npm install
npm run build          # writes the static export to out/
cd infra
npm install
npx cdk deploy --all
```

After the first deploy, subsequent app-only changes can skip a full `cdk
deploy` by just re-syncing `out/` to the bucket and invalidating CloudFront:

```bash
aws s3 sync out s3://<bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```
