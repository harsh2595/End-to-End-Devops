# Stage 6 File Structure

Stage 6 adds GitHub Actions workflows for CI/CD automation.

## Main Paths

- `.github/workflows/terraform-provision.yml`
- `.github/workflows/deploy.yml`
- `command-sequence/stage6-command-sequence.md`
- `file-structure/stage6-file-structure.md`
- `docs/stage-6-cicd.md`

## Workflow Responsibilities

- `terraform-provision.yml` provisions or destroys the Terraform-managed AWS infrastructure
- `deploy.yml` builds images and deploys the Helm chart to EKS

## Notes

- the workflows depend on the existing `terraform/` and `helm/` directories
- the deployment workflow expects the ingress controller to be managed separately in `ingress-nginx`
