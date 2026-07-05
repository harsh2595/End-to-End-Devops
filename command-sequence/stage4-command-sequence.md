# Stage 4 Command Sequence
Stage 4 comes after Stage 3 is applied. Do not destroy the Terraform infrastructure before running the Kubernetes stage, because Stage 4 depends on the EKS cluster and ECR repositories created here.

If Stage 3 is already successful, then run Stage 4 in this order.

## 1. Connect kubectl to EKS

Run this first so Kubernetes can talk to your EKS cluster:

```bash
aws eks update-kubeconfig --region ap-south-1 --name end-to-end-devops-dev-eks
```

## 2. Install Ingress Controller

If the cluster does not already have one, install an ingress controller before applying the Stage 4 manifests. This repo only requires that one controller exists and is watching `Ingress` resources.

For this project, the simplest option is the NGINX Ingress Controller.

Create the namespace and install the controller:

```bash
kubectl create namespace ingress-nginx
kubectl apply -n ingress-nginx -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

After installation, confirm it is present:

```bash
kubectl get ingressclass
kubectl get pods -A | grep -Ei 'ingress|nginx|alb'
```

If those commands return nothing, the controller is not ready yet.

Wait until the controller pod is `Running` before moving on.

The Stage 4 ingress manifest is set to `ingressClassName: nginx`, so this controller choice matches the YAML.

## 3. Build and Push Docker Images

This is the first Stage 4 script:

```bash
./k8s/build-and-push-images.sh
```

## 4. Prepare Secrets

Before applying the manifests, replace the placeholder `JWT_SECRET` in:

```text
k8s/base/secret.example.yaml
```

Keep the real secret value out of version control.

## 5. Apply Kubernetes Manifests

```bash
./k8s/apply-stage4.sh
```

## 6. Verify Deployment

After the apply finishes, check the ingress object. If the `ADDRESS` field is still empty, the manifests are applied but the ingress controller is not exposing the route yet.

Once the ingress is ready, open the load balancer DNS directly in your browser. The frontend is served at `/`, and its browser-facing API routes stay on the same origin under `/api/*`.

The API gateway remains an internal service behind the frontend proxy.

```bash
./k8s/verify-stage4.sh
```

## 7. Destroy Stage 4

When you are done with the Kubernetes stage, tear down the app resources in reverse order:

```bash
./k8s/destroy-stage4.sh
```

The destroy script deletes the ingress controller namespace first, then removes the app manifests and the application namespace.

After that, confirm that no Kubernetes load balancer services remain:

```bash
kubectl get svc -A | grep LoadBalancer || true
kubectl get ns ingress-nginx || true
```

Wait until the `ingress-nginx` namespace is gone and there are no remaining `LoadBalancer` services before running Terraform destroy. That gives AWS time to release the ENIs, security groups, and public addresses attached to the controller.

If you later reinstall Helm and see a webhook error like `validate.nginx.ingress.kubernetes.io`, the cluster may still have a stale ingress-nginx validating webhook. Remove it before retrying the install:

```bash
kubectl get validatingwebhookconfiguration | grep ingress
kubectl delete validatingwebhookconfiguration ingress-nginx-admission
```

To keep the ingress controller during teardown, set:

```bash
KEEP_INGRESS_CONTROLLER=true ./k8s/destroy-stage4.sh
```

## Full Stage 4 Flow

```bash
aws eks update-kubeconfig --region ap-south-1 --name end-to-end-devops-dev-eks
kubectl create namespace ingress-nginx
kubectl apply -n ingress-nginx -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
kubectl get ingressclass
kubectl get pods -A | grep -Ei 'ingress|nginx|alb'
./k8s/build-and-push-images.sh
./k8s/apply-stage4.sh
./k8s/verify-stage4.sh
./k8s/destroy-stage4.sh
kubectl get ns ingress-nginx || true
kubectl get svc -A | grep LoadBalancer || true
```
