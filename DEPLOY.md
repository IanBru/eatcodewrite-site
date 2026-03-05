# Deploy notes

- **Main**: OIDC role `eatcodewrite` (branch `main`). Set `AWS_ROLE_ARN` to that role’s ARN in repo secrets. Also: `S3_BUCKET=eatcodewrite-in-ireland`, `CLOUDFRONT_DISTRIBUTION_ID`, `AWS_REGION`.
- **Preview**: OIDC role `eatcodewrite_preview` (branches `ftr/*`). Set `AWS_ROLE_ARN_PREVIEW` to that role’s ARN. Same bucket and CloudFront; preview content goes under `preview/<branch-slug>/`.
- After adding the eatcodewrite roles in manage-aws, run `terraform output github_oidc_deploy_role_arns` to get the ARNs for the two roles.
