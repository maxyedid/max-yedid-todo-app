import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

const GITHUB_REPO = "maxyedid/max-yedid-todo-app";
const CDK_BOOTSTRAP_QUALIFIER = "hnb659fds";

export class GithubOidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, "GithubOidcProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
    });

    // Trust only workflow runs triggered from pushes to main in this repo —
    // matches deploy.yml's `on: push: branches: [main]` trigger exactly.
    const deployRole = new iam.Role(this, "GithubActionsDeployRole", {
      roleName: "github-actions-todo-app-deploy",
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        },
        StringLike: {
          "token.actions.githubusercontent.com:sub": `repo:${GITHUB_REPO}:ref:refs/heads/main`,
        },
      }),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // CDK deploys don't touch app resources directly — they assume the
    // bootstrap roles CDK already provisioned (`cdk bootstrap`), which in
    // turn are trusted by any principal in this account. Scoping to just
    // those roles keeps this role from needing S3/CloudFront/IAM permissions
    // of its own.
    const account = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [
          `arn:aws:iam::${account}:role/cdk-${CDK_BOOTSTRAP_QUALIFIER}-deploy-role-${account}-${region}`,
          `arn:aws:iam::${account}:role/cdk-${CDK_BOOTSTRAP_QUALIFIER}-file-publishing-role-${account}-${region}`,
          `arn:aws:iam::${account}:role/cdk-${CDK_BOOTSTRAP_QUALIFIER}-lookup-role-${account}-${region}`,
        ],
      })
    );

    new cdk.CfnOutput(this, "DeployRoleArn", { value: deployRole.roleArn });
  }
}
