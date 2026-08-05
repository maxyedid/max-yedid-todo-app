# To-Do App

Static Next.js to-do list (S3 + CloudFront), no backend — items live only in
in-memory React state for the current browser session. Infra is managed
with AWS CDK (TypeScript). Deploys run via GitHub Actions.

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
3. Deploy: `cd infra && npm install && npx cdk deploy --all`.
4. Note the `SiteUrl` output — that's your CloudFront URL (e.g.
   `https://dxxxxxxxxxxxxx.cloudfront.net`). There's no custom domain wired
   up; add Route53 + ACM to `infra/lib/site-stack.ts` later if you want one.

### 2. GitHub Actions (CI/CD)
1. Push this repo to GitHub.
2. Add these repository secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
   `AWS_REGION`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`.
   (Bucket name and distribution ID are printed as CDK stack outputs after
   your first manual deploy.)
3. From then on, pushes to `main` will build the static site, sync it to S3,
   invalidate the CloudFront cache, and redeploy infra via CDK.

## Local development

```bash
npm install
npm run dev
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
