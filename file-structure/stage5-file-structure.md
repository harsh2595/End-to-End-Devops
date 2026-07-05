# Stage 5 File Structure

Stage 5 adds a Helm chart scaffold alongside the existing Stage 4 Kubernetes manifests.

## Main Paths

- `helm/end-to-end-devops/`
- `command-sequence/stage5-command-sequence.md`
- `file-structure/stage5-file-structure.md`
- `docs/stage-5-helm.md`

## Helm Chart Layout

```text
helm/
`-- end-to-end-devops/
    |-- Chart.yaml
    |-- values.yaml
    |-- README.md
    `-- templates/
        |-- _helpers.tpl
        |-- namespace.yaml
        |-- configmap.yaml
        |-- secret.yaml
        |-- frontend-deployment.yaml
        |-- frontend-service.yaml
        |-- api-gateway-deployment.yaml
        |-- api-gateway-service.yaml
        |-- auth-service-deployment.yaml
        |-- auth-service-service.yaml
        |-- orders-service-deployment.yaml
        |-- orders-service-service.yaml
        |-- order-consumer-deployment.yaml
        |-- redis-deployment.yaml
        |-- redis-service.yaml
        |-- rabbitmq-deployment.yaml
        |-- rabbitmq-service.yaml
        `-- ingress.yaml
```

## Notes

- The chart should mirror the resources from `k8s/base/`.
- Image, namespace, ingress hostnames, and secrets should come from `values.yaml`.
- Keep the chart easy to render, lint, install, upgrade, rollback, and uninstall.
