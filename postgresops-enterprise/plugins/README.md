# Plugins

PostgresOps uses a **plugin contract** for vendor-specific HA, backup engines, and cloud integrations.

Planned interfaces (Python import paths under `postgresops.plugins` — to be formalized in Phase 2):

- `ClusterProvisioner`
- `BackupEngine`
- `ReplicationController`
- `AlertChannel`

Each plugin ships as an isolated wheel installed into the control-plane image or mounted volume in air-gapped sites.
