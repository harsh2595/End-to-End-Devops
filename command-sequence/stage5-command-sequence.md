# Stage 5 Command Sequence

Stage 5 packages the Stage 4 Kubernetes manifests into a reusable Helm chart.

## 1. Check Prerequisites

Make sure the Kubernetes cluster is reachable and Helm is installed:

```bash
helm version
kubectl get nodes
```

If you want external access through AWS, make sure an ingress controller with a `LoadBalancer` Service is installed in the cluster first.

Add the ingress-nginx Helm repository, create a separate namespace for the controller, and install it there:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create namespace ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer
```

If Helm reports an ownership conflict for `ClusterRole`, `ClusterRoleBinding`, or `IngressClass`, clean up the old ingress-nginx resources first:

```bash
kubectl get clusterrole | grep ingress-nginx
kubectl get clusterrolebinding | grep ingress-nginx
kubectl get ingressclass
kubectl delete clusterrole ingress-nginx
kubectl delete clusterrolebinding ingress-nginx
kubectl delete ingressclass nginx
```

## 2. Create the Helm Chart

The chart scaffold already lives in:

```text
helm/end-to-end-devops
```

If you ever need to recreate the structure:

```bash
helm create helm/end-to-end-devops
```

Then replace the generated templates with the project-specific files in this repo.
Do not run `helm create` again unless you intentionally want to regenerate the chart, because it can overwrite the custom Stage 5 templates and `values.yaml`.

## 3. Validate the Chart

Render the chart locally:

```bash
helm template end-to-end-devops ./helm/end-to-end-devops
```

Lint the chart:

```bash
helm lint ./helm/end-to-end-devops
```

Render with a custom image tag:

```bash
helm template end-to-end-devops ./helm/end-to-end-devops --set image.tag=v1
```

## 4. Install

Install the chart into Kubernetes:

command to generate JWT Secret: openssl rand -base64 32

```bash
helm upgrade --install end-to-end-devops ./helm/end-to-end-devops \
  --namespace end-to-end-devops \
  --create-namespace \
  --set secrets.jwtSecret='your-real-secret'
```

If you removed the ingress controller earlier and Helm fails with a webhook error such as `validate.nginx.ingress.kubernetes.io`, delete the stale ingress-nginx validating webhook first:

```bash
kubectl get validatingwebhookconfiguration | grep ingress
kubectl delete validatingwebhookconfiguration ingress-nginx-admission
```

If you already have a `values.local.yaml`, you can use that instead of `--set`:

```bash
helm upgrade --install end-to-end-devops ./helm/end-to-end-devops \
  --namespace end-to-end-devops \
  --create-namespace \
  -f values.local.yaml
```

Verify the release:

```bash
helm list -n end-to-end-devops
kubectl get all -n end-to-end-devops
kubectl get svc -n ingress-nginx
```

Wait for the ingress controller `EXTERNAL-IP` to appear, then open that address in your browser. The frontend service stays `ClusterIP` and traffic reaches it through the ingress controller. You do not need a custom host entry for the chart to work now because the ingress rule matches any host.

## 8. Uninstall Ingress Controller

When you are done with Stage 5, remove the ingress controller release first:

```bash
helm uninstall ingress-nginx -n ingress-nginx
```

Then delete the namespace:

```bash
kubectl delete namespace ingress-nginx
```

If Helm refuses to install the controller again later because of leftover cluster-scoped resources, remove the stale objects first:

```bash
kubectl get clusterrole | grep ingress-nginx
kubectl get clusterrolebinding | grep ingress-nginx
kubectl get ingressclass
kubectl delete clusterrole ingress-nginx
kubectl delete clusterrolebinding ingress-nginx
kubectl delete ingressclass nginx
```

## 5. Upgrade

After pushing a new image tag:

```bash
helm upgrade end-to-end-devops ./helm/end-to-end-devops \
  --namespace end-to-end-devops \
  --set image.tag=v2
```

Check rollout status:

```bash
kubectl rollout status deployment/frontend -n end-to-end-devops
kubectl rollout status deployment/api-gateway -n end-to-end-devops
kubectl rollout status deployment/auth-service -n end-to-end-devops
kubectl rollout status deployment/orders-service -n end-to-end-devops
```

## 6. Rollback

```bash
helm history end-to-end-devops -n end-to-end-devops
helm rollback end-to-end-devops 1 -n end-to-end-devops
```

## 7. Uninstall

```bash
helm uninstall end-to-end-devops -n end-to-end-devops
kubectl delete namespace end-to-end-devops
```

## Secret Note

The default `secrets.jwtSecret: replace-me` in `helm/end-to-end-devops/values.yaml` is only a placeholder. Override it at install time with `--set secrets.jwtSecret=...` or a local values file before deploying the chart.
