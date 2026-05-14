from __future__ import annotations


class ClusterNameConflict(Exception):
    """Raised when a cluster name collides with an existing row (unique constraint)."""
