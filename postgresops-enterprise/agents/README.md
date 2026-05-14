# pgops-agent

Lightweight edge component. Phase 1 implements a **control-plane reachability probe** only.

Install:

```bash
cd agents
pip install -e .
python -m pgops_agent.main
```

Environment:

- `POSTGRESOPS_CONTROL_PLANE_URL` — base URL (default `http://127.0.0.1:8000`)
