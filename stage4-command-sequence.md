# Stage 4 Command Sequence

If Stage 3 is already successful, then run Stage 4 in this order.

## 1. Connect kubectl to EKS

Run this first so Kubernetes can talk to your EKS cluster:

```bash
aws eks update-kubeconfig --region ap-south-1 --name end-to-end-devops-dev-eks
```

## 2. Build and Push Docker Images

This is the first Stage 4 script:

```bash
./k8s/build-and-push-images.sh
```

## 3. Apply Kubernetes Manifests

```bash
./k8s/apply-stage4.sh
```

## 4. Verify Deployment

```bash
./k8s/verify-stage4.sh
```

## Full Stage 4 Flow

```bash
aws eks update-kubeconfig --region ap-south-1 --name end-to-end-devops-dev-eks
./k8s/build-and-push-images.sh
./k8s/apply-stage4.sh
./k8s/verify-stage4.sh
```
