# end-to-end-devops Helm Chart

This chart is the Stage 5 scaffold for the project.

## Next Steps

- convert the Kubernetes manifests from `k8s/base/` into templates
- keep resource names and labels consistent with the existing Stage 4 deployment
- verify rendering with `helm template` and `helm lint`

## Current Deployment Model

- the `frontend` service stays `ClusterIP`
- traffic reaches the app through an ingress controller running in the separate `ingress-nginx` namespace
- the AWS load balancer belongs to the ingress controller Service, not the frontend Service

## Suggested Install Flow

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create namespace ingress-nginx
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=LoadBalancer
helm upgrade --install end-to-end-devops ./helm/end-to-end-devops \
  --namespace end-to-end-devops \
  --create-namespace \
  --set secrets.jwtSecret='your-real-secret'
kubectl get svc -n ingress-nginx
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

Wait for the ingress controller `EXTERNAL-IP` to appear, then open that address in your browser.

## Uninstall Ingress Controller

When you are done with the chart and want to remove the controller too:

```bash
helm uninstall ingress-nginx -n ingress-nginx
kubectl delete namespace ingress-nginx
```

If Helm later complains about leftover cluster-scoped resources, clean them up first:

```bash
kubectl get clusterrole | grep ingress-nginx
kubectl get clusterrolebinding | grep ingress-nginx
kubectl get ingressclass
kubectl delete clusterrole ingress-nginx
kubectl delete clusterrolebinding ingress-nginx
kubectl delete ingressclass nginx
```
