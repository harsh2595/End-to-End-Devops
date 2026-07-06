# Stage 6 GitHub IAM Policies

Use these policies with the IAM role or roles assumed by GitHub Actions in Stage 6.

## Files

- [Terraform role policy](terraform-role-policy.json)
- [Deploy role policy](deploy-role-policy.json)
- [GitHub OIDC trust policy](github-oidc-trust-policy.json)

## How to use

1. Create an IAM role for GitHub Actions.
2. Attach the matching permissions policy to that role.
3. Apply the trust policy so GitHub Actions can assume the role through OIDC.
4. Store the role ARN in `AWS_ROLE_TO_ASSUME` in GitHub repository secrets.

## Notes

- The Terraform policy is broader because Terraform usually manages many AWS resources.
- The deploy policy is smaller because it only needs EKS describe access and ECR push/pull access.
- The trust policy must be updated with your own GitHub repository path.
