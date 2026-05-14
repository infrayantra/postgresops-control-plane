# Kubernetes manifests

Helm is the preferred install path (`helm/postgresops`). Raw manifests in this directory are optional overlays for:

- NetworkPolicies restricting agent → API traffic
- PodSecurity admission profiles
- ExternalSecrets / Vault Agent Injector bindings
