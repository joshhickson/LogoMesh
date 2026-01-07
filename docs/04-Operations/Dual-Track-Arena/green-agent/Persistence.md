---
status: ACTIVE
type: Spec
---
> **Context:**
> *   [2025-12-29]: Documentation for the SQLite persistence layer implemented in the Green Agent.

# Green Agent Persistence Layer

## Overview
The Green Agent (Assessor) includes a built-in persistence layer to locally store evaluation results from battles. This ensures that every assessment is recorded even if the upstream reporting fails, providing a reliable audit trail for "Contextual Debt" scores.

## Data Store
- **Database Engine:** SQLite
- **File Location:** `data/battles.db`
- **Schema Management:** Auto-migration (Table created on first run if missing)

## Schema
The data is stored in a single table named `battles`.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Internal unique identifier for the record. |
| `battle_id` | TEXT | NOT NULL | The unique ID of the battle/evaluation session. |
| `timestamp` | TEXT | NOT NULL | ISO 8601 timestamp of when the result was saved. |
| `score` | REAL | NOT NULL | The calculated Contextual Debt Score. |
| `breakdown` | TEXT | - | Textual explanation of the score components. |
| `raw_result` | TEXT | - | The full JSON result object dumped as a string for full fidelity. |

## Usage
The persistence logic is encapsulated in `src/green_logic/agent.py`.
The `submit_result` method automatically handles the database connection and insertion.

```python
# Example Usage within GreenAgent
result = {
    "battle_id": "battle-123",
    "score": 95.0,
    "breakdown": "High architectural debt detected."
}
agent.submit_result(result)
```

## Maintenance & Troubleshooting
- **Missing Directory:** The code automatically creates the `data/` directory if it does not exist.
- **Concurrency:** SQLite handles file locking automatically. For high-throughput scenarios, consider migrating to a server-based DB (PostgreSQL).
- **Backups:** Simply copy the `data/battles.db` file to back up your evaluation history.

## Future Improvements
- **Migration to PostgreSQL:** For production deployments with multiple Green Agent replicas, switch to a centralized database.
- **ORM Integration:** Adopt SQLAlchemy or SQLModel for better type safety and schema management if the data model becomes complex.
- **API Access:** Expose an endpoint `GET /battles` in `src/green_logic/server.py` to query this database via the API.
