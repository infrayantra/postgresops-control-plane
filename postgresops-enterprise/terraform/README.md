# Terraform

Placeholders for VPC, private subnets, managed PostgreSQL for the **control catalog**, object storage for backups, and KMS keys.

Enterprise deployments typically split:

- **Control plane** (this repo’s API + workers)
- **Observability** (Prometheus / Grafana / Loki)
- **Data plane** (customer clusters — out of Terraform scope except agent networking)
