# Coding tasks to send to purple agents
CODING_TASKS = [
    {
        "id": "task-001",
        "title": "Email Validator",
        "description": """
Implement an email validation function with the following requirements:

1. Create a function `validate_email(email: str) -> dict`
2. Return {"valid": True/False, "reason": "explanation"}
3. Check for:
   - Presence of exactly one @ symbol
   - Non-empty local part (before @)
   - Syntactically valid domain (after @) with at least one dot using Regex ONLY
   - No spaces allowed
   - **IMPORTANT: Use Regex pattern matching ONLY. NO network calls (no socket, dns, urllib)**
   - **NO DNS lookups, NO MX record validation, NO HTTP requests**
4. Handle edge cases gracefully

Provide your response as JSON with:
- sourceCode: Your implementation (Regex-based validation only)
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
""",
        "constraints": {"no_network_calls": True, "regex_only": True}  # A-000 constraint
    },
    {
        "id": "task-002",
        "title": "Rate Limiter",
        "description": """
Implement a rate limiter class with the following requirements:

1. Create a class `RateLimiter` with a method `is_allowed(client_id: str) -> bool`
2. Limit clients to 10 requests per minute
3. Use an in-memory store (e.g., a dictionary)
4. The method should return `True` if the request is allowed, `False` otherwise
5. Ensure the solution is efficient and handles multiple clients

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
""",
        "constraints": {}  # No special constraints
    },
    {
        "id": "task-003",
        "title": "LRU Cache",
        "description": """
Implement an LRU (Least Recently Used) Cache with the following requirements:

1. Create a class `LRUCache` with a fixed capacity
2. Implement `get(key)` and `put(key, value)` methods
3. If the cache is full, the `put` operation should evict the least recently used item
4. The cache should store key-value pairs
5. Both get and put should be O(1) operations

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
""",
        "constraints": {}  # No special constraints
    },
    {
        "id": "task-004",
        "title": "Recursive Fibonacci",
        "description": """
Implement a Fibonacci function with the following STRICT requirements:

1. Create a function `fibonacci(n: int) -> int`
2. Return the n-th Fibonacci number (0-indexed: fib(0)=0, fib(1)=1, fib(2)=1, ...)
3. **CRITICAL CONSTRAINT: You MUST use recursion. No loops allowed.**
4. Handle edge cases (n < 0 should return 0)
5. Optimize if possible (memoization is allowed)

**ALGORITHMIC CONSTRAINTS (enforced by static analysis):**
- Must use recursive function calls
- No `for` or `while` loops permitted
- No imports of `os`, `sys`, or `subprocess`

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
""",
        "constraints": {
            "require_recursion": True,
            "forbid_loops": True
        },
        "hidden_tests": """
# Hidden tests - Purple Agent's tests are IGNORED for this task
# These tests are run by the Green Agent to verify correctness
from solution import fibonacci

def test_fibonacci_base_cases():
    \"\"\"Test base cases: fib(0) = 0, fib(1) = 1\"\"\"
    assert fibonacci(0) == 0, "fib(0) should be 0"
    assert fibonacci(1) == 1, "fib(1) should be 1"

def test_fibonacci_small_values():
    \"\"\"Test small Fibonacci values\"\"\"
    assert fibonacci(2) == 1, "fib(2) should be 1"
    assert fibonacci(5) == 5, "fib(5) should be 5"
    assert fibonacci(10) == 55, "fib(10) should be 55"

def test_fibonacci_larger_value():
    \"\"\"Test a larger Fibonacci number\"\"\"
    assert fibonacci(15) == 610, "fib(15) should be 610"

def test_fibonacci_negative():
    \"\"\"Test negative input returns 0\"\"\"
    assert fibonacci(-1) == 0, "fib(-1) should be 0"
    assert fibonacci(-100) == 0, "fib(-100) should be 0"
"""
    },

    # ============================================================
    # INTERMEDIATE TASKS (5-8): Data Structures & Algorithms
    # ============================================================
    {
        "id": "task-005",
        "title": "JSON Web Token (JWT) Parser",
        "description": """
Implement a JWT parser and validator with the following requirements:

1. Create a class `JWTParser` with methods:
   - `decode(token: str) -> dict` - Decode JWT and return payload
   - `validate_signature(token: str, secret: str) -> bool` - Validate HMAC-SHA256 signature
   - `is_expired(token: str) -> bool` - Check if token is expired based on 'exp' claim

2. JWT structure: header.payload.signature (base64url encoded, dot-separated)

3. Requirements:
   - Parse all three parts correctly
   - Handle base64url encoding (different from standard base64)
   - Return decoded JSON payload as dict
   - Validate HMAC-SHA256 signatures using the `hmac` and `hashlib` modules
   - Check 'exp' claim against current time

4. Handle errors gracefully:
   - Invalid format (not 3 parts)
   - Invalid base64 encoding
   - Invalid JSON in payload
   - Missing required claims

**ALLOWED IMPORTS:** base64, json, hmac, hashlib, time

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests (recommended)
- rationale: Explain your design decisions
""",
        "constraints": {
            "allowed_imports": ["base64", "json", "hmac", "hashlib", "time"]
        }
    },
    {
        "id": "task-006",
        "title": "Thread-Safe Connection Pool",
        "description": """
Implement a thread-safe database connection pool with the following requirements:

1. Create a class `ConnectionPool` with:
   - `__init__(self, max_connections: int, connection_factory: Callable)`
   - `acquire(self, timeout: float = None) -> Connection` - Get a connection from pool
   - `release(self, connection) -> None` - Return connection to pool
   - `__enter__` and `__exit__` for context manager support

2. Requirements:
   - Thread-safe using `threading` primitives (Lock, Semaphore, or Condition)
   - Block when pool is exhausted (up to timeout)
   - Raise `TimeoutError` if timeout exceeded
   - Track active vs available connections
   - Support context manager: `with pool.acquire() as conn:`

3. Connection factory is a callable that returns a mock connection object

4. Properties:
   - `available` - Number of available connections
   - `in_use` - Number of connections currently in use

**ALLOWED IMPORTS:** threading, time, queue, contextlib

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests with threading scenarios
- rationale: Explain your thread-safety approach
""",
        "constraints": {
            "allowed_imports": ["threading", "time", "queue", "contextlib"],
            "require_thread_safety": True
        }
    },
    {
        "id": "task-007",
        "title": "Event-Driven State Machine",
        "description": """
Implement a generic finite state machine (FSM) with event-driven transitions:

1. Create a class `StateMachine` with:
   - `__init__(self, initial_state: str)`
   - `add_transition(self, from_state: str, event: str, to_state: str, callback: Callable = None)`
   - `trigger(self, event: str) -> bool` - Trigger event, return True if transition occurred
   - `current_state` property

2. Create a class `OrderStateMachine(StateMachine)` implementing e-commerce order flow:
   - States: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, REFUNDED
   - Events: confirm, ship, deliver, cancel, refund
   - Valid transitions:
     * PENDING -> CONFIRMED (on 'confirm')
     * PENDING -> CANCELLED (on 'cancel')
     * CONFIRMED -> SHIPPED (on 'ship')
     * CONFIRMED -> CANCELLED (on 'cancel')
     * SHIPPED -> DELIVERED (on 'deliver')
     * DELIVERED -> REFUNDED (on 'refund')

3. Requirements:
   - Invalid transitions should return False, not raise exceptions
   - Callbacks receive (from_state, event, to_state) arguments
   - Support transition history: `get_history() -> List[Tuple[str, str, str]]`

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests covering all transitions and edge cases
- rationale: Explain your design decisions
""",
        "constraints": {}
    },
    {
        "id": "task-008",
        "title": "Binary Merkle Tree",
        "description": """
Implement a Merkle Tree for data integrity verification:

1. Create a class `MerkleTree` with:
   - `__init__(self, data_blocks: List[bytes])`
   - `root_hash` property - Returns the root hash (hex string)
   - `get_proof(self, index: int) -> List[Tuple[str, bytes]]` - Get inclusion proof
   - `verify_proof(cls, leaf: bytes, proof: List, root: str) -> bool` - Static method

2. Requirements:
   - Use SHA-256 for hashing
   - Leaf nodes: `hash(0x00 + data)`
   - Internal nodes: `hash(0x01 + left_hash + right_hash)`
   - Handle non-power-of-2 leaves by duplicating the last leaf
   - Proof format: list of (position, sibling_hash) tuples where position is 'L' or 'R'

3. The proof should allow verification without rebuilding the entire tree

4. Example:
   ```
   tree = MerkleTree([b"tx1", b"tx2", b"tx3", b"tx4"])
   proof = tree.get_proof(2)  # Proof for "tx3"
   assert MerkleTree.verify_proof(b"tx3", proof, tree.root_hash)
   ```

**ALLOWED IMPORTS:** hashlib

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests including proof verification
- rationale: Explain the Merkle tree structure and proof algorithm
""",
        "constraints": {
            "allowed_imports": ["hashlib"]
        }
    },

    # ============================================================
    # ADVANCED TASKS (9-12): Crypto & Blockchain
    # ============================================================
    {
        "id": "task-009",
        "title": "Simple Blockchain Implementation",
        "description": """
Implement a basic blockchain with proof-of-work:

1. Create a `Block` dataclass with:
   - index: int
   - timestamp: float
   - data: dict
   - previous_hash: str
   - nonce: int
   - hash: str (computed)

2. Create a `Blockchain` class with:
   - `__init__(self, difficulty: int = 4)` - Number of leading zeros required
   - `create_genesis_block(self) -> Block`
   - `add_block(self, data: dict) -> Block` - Mine and add new block
   - `is_valid(self) -> bool` - Validate entire chain integrity
   - `chain` property - Returns list of blocks

3. Mining requirements:
   - Hash = SHA-256(index + timestamp + data + previous_hash + nonce)
   - Find nonce such that hash starts with `difficulty` zeros
   - `mine_block(self, block: Block) -> Block`

4. Validation checks:
   - Genesis block is correct
   - Each block's previous_hash matches prior block's hash
   - Each block's hash is correctly computed
   - Each hash meets difficulty requirement

**ALLOWED IMPORTS:** hashlib, json, time, dataclasses

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for mining, validation, and tampering detection
- rationale: Explain your proof-of-work implementation
""",
        "constraints": {
            "allowed_imports": ["hashlib", "json", "time", "dataclasses"]
        }
    },
    {
        "id": "task-010",
        "title": "Cryptocurrency Wallet (HD Wallet)",
        "description": """
Implement a hierarchical deterministic (HD) wallet key derivation system:

1. Create a class `HDWallet` with:
   - `__init__(self, seed: bytes)` - 32-byte seed
   - `derive_private_key(self, path: str) -> bytes` - Derive key from path like "m/44'/0'/0'/0/0"
   - `get_public_key(self, private_key: bytes) -> bytes` - Derive public key
   - `get_address(self, public_key: bytes) -> str` - Generate address (simplified)

2. Key derivation (simplified BIP-32-like):
   - Master key: HMAC-SHA512(key=b"Bitcoin seed", msg=seed)
   - First 32 bytes = private key, last 32 bytes = chain code
   - Child derivation: HMAC-SHA512(key=chain_code, msg=parent_key + index_bytes)
   - Hardened derivation (index >= 0x80000000): use 0x00 + private_key + index

3. Address generation (simplified):
   - SHA256 -> RIPEMD160 -> prepend version byte (0x00) -> Base58Check encode
   - Implement Base58Check with checksum (first 4 bytes of double SHA256)

4. Path parsing:
   - "m" = master
   - "44'" = hardened index 44 (add 0x80000000)
   - "0" = normal index 0

**ALLOWED IMPORTS:** hashlib, hmac, struct

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for key derivation paths
- rationale: Explain HD wallet derivation scheme
""",
        "constraints": {
            "allowed_imports": ["hashlib", "hmac", "struct"]
        }
    },
    {
        "id": "task-011",
        "title": "Digital Signature Scheme (ECDSA Simplified)",
        "description": """
Implement a simplified ECDSA-like signature scheme:

1. Create a class `SignatureScheme` with:
   - `generate_keypair(self) -> Tuple[int, Tuple[int, int]]` - (private_key, public_key_point)
   - `sign(self, private_key: int, message: bytes) -> Tuple[int, int]` - (r, s) signature
   - `verify(self, public_key: Tuple[int, int], message: bytes, signature: Tuple[int, int]) -> bool`

2. Use a small elliptic curve for demonstration (secp256k1 parameters simplified):
   - Curve: y² = x³ + 7 (mod p)
   - Use small prime p for testing (e.g., p = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F or smaller)
   - Generator point G and order n provided as constants

3. Implement point arithmetic:
   - `point_add(P, Q)` - Elliptic curve point addition
   - `scalar_mult(k, P)` - Scalar multiplication using double-and-add

4. Signature algorithm:
   - k = random nonce (1 < k < n)
   - R = k * G, r = R.x mod n
   - s = k⁻¹ * (hash(m) + r * private_key) mod n
   - Signature = (r, s)

5. Verification:
   - w = s⁻¹ mod n
   - u1 = hash(m) * w mod n
   - u2 = r * w mod n
   - Point = u1*G + u2*PublicKey
   - Valid if Point.x == r

**ALLOWED IMPORTS:** hashlib, secrets (for random)

Provide your response as JSON with:
- sourceCode: Your implementation with point arithmetic
- testCode: Unit tests for sign/verify cycle
- rationale: Explain the ECDSA mathematics
""",
        "constraints": {
            "allowed_imports": ["hashlib", "secrets"]
        }
    },
    {
        "id": "task-012",
        "title": "Simple Token Contract (ERC-20 Logic)",
        "description": """
Implement ERC-20-like token logic in Python (simulating smart contract behavior):

1. Create a class `Token` with:
   - `__init__(self, name: str, symbol: str, decimals: int, initial_supply: int, owner: str)`
   - `balance_of(self, address: str) -> int`
   - `transfer(self, sender: str, recipient: str, amount: int) -> bool`
   - `approve(self, owner: str, spender: str, amount: int) -> bool`
   - `transfer_from(self, spender: str, sender: str, recipient: str, amount: int) -> bool`
   - `allowance(self, owner: str, spender: str) -> int`
   - `mint(self, caller: str, to: str, amount: int) -> bool` - Only owner can mint
   - `burn(self, caller: str, amount: int) -> bool`

2. Requirements:
   - Track balances in a dict: `{address: balance}`
   - Track allowances in nested dict: `{owner: {spender: amount}}`
   - Emit events as list of dicts: `[{"event": "Transfer", "from": ..., "to": ..., "amount": ...}]`
   - All amounts are in smallest unit (like wei)
   - Return False (don't raise) on insufficient balance/allowance

3. Implement `total_supply` property that tracks mints and burns

4. Event types:
   - Transfer(from, to, amount)
   - Approval(owner, spender, amount)

5. Security checks:
   - Cannot transfer to zero address (use "0x0" as zero)
   - Cannot transfer more than balance
   - Cannot transferFrom more than allowance

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for all ERC-20 functions
- rationale: Explain your event emission and allowance logic
""",
        "constraints": {}
    },

    # ============================================================
    # ADVANCED TASKS (13-16): Backend & API Development
    # ============================================================
    {
        "id": "task-013",
        "title": "REST API Router with Middleware",
        "description": """
Implement a lightweight REST API router framework:

1. Create a class `Router` with:
   - `route(self, method: str, path: str)` - Decorator to register handlers
   - `use(self, middleware: Callable)` - Add middleware
   - `handle(self, method: str, path: str, request: dict) -> dict` - Route and handle request

2. Create middleware functions:
   - `logging_middleware(handler)` - Log request method, path, response status
   - `auth_middleware(handler)` - Check for 'Authorization' header, return 401 if missing
   - `rate_limit_middleware(max_requests: int, window: int)` - Factory returning middleware

3. Path parameter support:
   - `/users/{user_id}` matches `/users/123` with params = {"user_id": "123"}
   - `/posts/{post_id}/comments/{comment_id}` - Multiple params

4. Response format:
   - `{"status": 200, "body": {...}, "headers": {...}}`
   - 404 for unmatched routes
   - 405 for wrong method on matched path

5. Example usage:
   ```python
   router = Router()
   router.use(logging_middleware)

   @router.route("GET", "/users/{user_id}")
   def get_user(request, params):
       return {"status": 200, "body": {"id": params["user_id"]}}
   ```

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for routing, params, and middleware chain
- rationale: Explain your middleware composition approach
""",
        "constraints": {}
    },
    {
        "id": "task-014",
        "title": "Database Query Builder (SQL)",
        "description": """
Implement a fluent SQL query builder with parameterized queries:

1. Create a class `QueryBuilder` with fluent interface:
   - `select(*columns)` - SELECT columns (default *)
   - `from_table(table)` - FROM table
   - `where(column, operator, value)` - WHERE condition
   - `and_where(column, operator, value)` - AND condition
   - `or_where(column, operator, value)` - OR condition
   - `join(table, on_left, on_right, join_type="INNER")` - JOIN clause
   - `order_by(column, direction="ASC")` - ORDER BY
   - `limit(n)` - LIMIT
   - `offset(n)` - OFFSET
   - `build() -> Tuple[str, List]` - Return (sql_string, parameters)

2. Requirements:
   - Use parameterized queries (? placeholders) to prevent SQL injection
   - Support operators: =, !=, <, >, <=, >=, LIKE, IN, IS NULL, IS NOT NULL
   - IN operator should expand to (?, ?, ?) for list values
   - Method chaining: `QueryBuilder().select("id", "name").from_table("users").where("age", ">", 18).build()`

3. Create class `InsertBuilder`:
   - `into(table)` - INTO table
   - `columns(*cols)` - Column names
   - `values(*vals)` - Values (parameterized)
   - `build() -> Tuple[str, List]`

4. Create class `UpdateBuilder`:
   - `table(table)` - UPDATE table
   - `set(column, value)` - SET column = ?
   - `where(column, operator, value)` - WHERE clause
   - `build() -> Tuple[str, List]`

**IMPORTANT: All user values must be parameterized, never interpolated into SQL string**

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests with complex queries
- rationale: Explain SQL injection prevention strategy
""",
        "constraints": {
            "require_parameterized_queries": True
        }
    },
    {
        "id": "task-015",
        "title": "Event Sourcing & CQRS Pattern",
        "description": """
Implement an event sourcing system with CQRS (Command Query Responsibility Segregation):

1. Create base classes:
   - `Event` dataclass with: event_id, aggregate_id, event_type, data, timestamp, version
   - `Command` dataclass with: command_type, aggregate_id, data
   - `Aggregate` base class with: id, version, `apply(event)`, `get_uncommitted_events()`

2. Create `BankAccount(Aggregate)` with events:
   - AccountOpened(owner_name, initial_balance)
   - MoneyDeposited(amount)
   - MoneyWithdrawn(amount)
   - AccountClosed(reason)

3. Create `EventStore` class:
   - `append(aggregate_id: str, events: List[Event], expected_version: int)` - Optimistic concurrency
   - `get_events(aggregate_id: str) -> List[Event]` - Retrieve event stream
   - `get_events_since(aggregate_id: str, version: int) -> List[Event]`
   - Raise `ConcurrencyError` if expected_version doesn't match

4. Create `CommandHandler`:
   - `handle(command: Command) -> List[Event]`
   - Commands: OpenAccount, Deposit, Withdraw, CloseAccount
   - Validate business rules (no negative balance, account must be open)

5. Create `ReadModel` (projection):
   - `AccountSummary` with: id, owner, balance, status, last_updated
   - `project(events: List[Event])` - Update read model from events

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for full event sourcing cycle
- rationale: Explain CQRS benefits and event sourcing consistency guarantees
""",
        "constraints": {
            "allowed_imports": ["dataclasses", "time", "uuid", "typing"]
        }
    },
    {
        "id": "task-016",
        "title": "Distributed Task Queue",
        "description": """
Implement an in-memory distributed task queue system:

1. Create a `Task` dataclass:
   - task_id: str (UUID)
   - task_type: str
   - payload: dict
   - status: str (PENDING, RUNNING, COMPLETED, FAILED, RETRYING)
   - retries: int
   - max_retries: int
   - result: Optional[Any]
   - error: Optional[str]
   - created_at, started_at, completed_at: float timestamps

2. Create `TaskQueue` class:
   - `enqueue(task_type: str, payload: dict, max_retries: int = 3) -> str` - Returns task_id
   - `dequeue(self) -> Optional[Task]` - Get next pending task (FIFO)
   - `complete(self, task_id: str, result: Any)` - Mark completed
   - `fail(self, task_id: str, error: str)` - Mark failed, auto-retry if retries < max
   - `get_status(self, task_id: str) -> Task`
   - `get_pending_count(self) -> int`
   - `get_dead_letter_queue(self) -> List[Task]` - Tasks that exceeded max_retries

3. Create `Worker` class:
   - `__init__(self, queue: TaskQueue, handlers: Dict[str, Callable])`
   - `process_one(self) -> bool` - Process single task, return True if processed
   - `run(self, max_tasks: int = None)` - Process tasks until queue empty or max reached

4. Implement priority queue variant `PriorityTaskQueue`:
   - `enqueue(task_type, payload, priority: int = 0, ...)` - Higher priority = processed first
   - Use heap-based ordering

5. Thread-safety: All queue operations must be thread-safe

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests including retry logic and dead letter queue
- rationale: Explain your queue design and retry strategy
""",
        "constraints": {
            "allowed_imports": ["threading", "time", "uuid", "dataclasses", "heapq", "typing"],
            "require_thread_safety": True
        }
    },

    # ============================================================
    # EXPERT TASKS (17-20): System Design & Advanced Patterns
    # ============================================================
    {
        "id": "task-017",
        "title": "Raft Consensus (Leader Election)",
        "description": """
Implement the leader election portion of the Raft consensus algorithm:

1. Create `RaftNode` class with states: FOLLOWER, CANDIDATE, LEADER
   - `__init__(self, node_id: str, peers: List[str])`
   - `current_term: int`
   - `voted_for: Optional[str]`
   - `state: str`
   - `leader_id: Optional[str]`

2. Implement RPC message types:
   - `RequestVote(term, candidate_id, last_log_index, last_log_term)`
   - `RequestVoteResponse(term, vote_granted)`
   - `AppendEntries(term, leader_id, prev_log_index, prev_log_term, entries, leader_commit)` (heartbeat when entries=[])
   - `AppendEntriesResponse(term, success)`

3. Implement core methods:
   - `on_request_vote(self, msg: RequestVote) -> RequestVoteResponse`
   - `on_append_entries(self, msg: AppendEntries) -> AppendEntriesResponse`
   - `start_election(self) -> List[RequestVote]` - Transition to candidate, increment term
   - `collect_votes(self, responses: List[RequestVoteResponse]) -> bool` - Check majority
   - `become_leader(self)` - Transition to leader state
   - `step_down(self, new_term: int)` - Revert to follower if higher term seen

4. Election rules:
   - Grant vote if: candidate's term >= current_term AND (voted_for is None or candidate_id) AND candidate's log is up-to-date
   - Majority = (len(peers) + 1) // 2 + 1
   - Reset election timeout on valid AppendEntries from leader

5. Create `simulate_election(nodes: List[RaftNode], partitions: List[Set[str]] = None) -> str`:
   - Simulate an election round and return the elected leader_id

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for election scenarios including split vote
- rationale: Explain Raft leader election guarantees
""",
        "constraints": {
            "allowed_imports": ["dataclasses", "typing", "random", "time"]
        }
    },
    {
        "id": "task-018",
        "title": "B-Tree Index Implementation",
        "description": """
Implement a B-Tree for database indexing:

1. Create `BTreeNode` class:
   - `keys: List[Any]` - Sorted keys
   - `values: List[Any]` - Values (only in leaf nodes)
   - `children: List[BTreeNode]` - Child pointers (internal nodes)
   - `is_leaf: bool`
   - `parent: Optional[BTreeNode]`

2. Create `BTree` class with order `t` (minimum degree):
   - `__init__(self, t: int = 3)` - Each node has at most 2t-1 keys
   - `insert(self, key, value)` - Insert key-value pair
   - `search(self, key) -> Optional[Any]` - Find value by key
   - `delete(self, key) -> bool` - Remove key, return True if found
   - `range_query(self, start_key, end_key) -> List[Tuple[key, value]]` - Range scan

3. Implement B-Tree operations:
   - `_split_child(self, parent, index)` - Split full child node
   - `_insert_non_full(self, node, key, value)` - Insert into non-full node
   - `_merge_nodes(self, parent, index)` - Merge underfull siblings
   - `_borrow_from_sibling(self, parent, index, from_left: bool)` - Rebalance

4. Properties:
   - `height` - Tree height
   - `size` - Total number of keys
   - `to_list() -> List[Tuple[key, value]]` - In-order traversal

5. Invariants to maintain:
   - Root has at least 1 key (or is empty tree)
   - Non-root nodes have at least t-1 keys
   - All nodes have at most 2t-1 keys
   - All leaves are at same depth

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for insert, delete, split, merge scenarios
- rationale: Explain B-Tree balancing and why it's suited for disk-based storage
""",
        "constraints": {
            "allowed_imports": ["typing"]
        }
    },
    {
        "id": "task-019",
        "title": "Consistent Hashing Ring",
        "description": """
Implement a consistent hashing ring for distributed caching:

1. Create `HashRing` class:
   - `__init__(self, nodes: List[str] = None, virtual_nodes: int = 150)`
   - `add_node(self, node: str)` - Add node with virtual nodes
   - `remove_node(self, node: str)` - Remove node and its virtual nodes
   - `get_node(self, key: str) -> str` - Get responsible node for key
   - `get_nodes(self, key: str, n: int = 3) -> List[str]` - Get n replica nodes

2. Requirements:
   - Use SHA-256 hash, take first 8 bytes as position on ring (0 to 2^64-1)
   - Virtual nodes: each physical node maps to `virtual_nodes` positions
   - Virtual node naming: "{node}#{i}" for i in range(virtual_nodes)
   - Clockwise lookup: find smallest position >= hash(key), wrap around

3. Implement rebalancing analysis:
   - `get_distribution(self, keys: List[str]) -> Dict[str, int]` - Count keys per node
   - `get_load_factor(self, keys: List[str]) -> float` - max_load / average_load

4. Implement node change analysis:
   - `simulate_add_node(self, new_node: str, keys: List[str]) -> Dict[str, List[str]]`
     Returns {new_node: [keys that would move to it]}
   - `simulate_remove_node(self, node: str, keys: List[str]) -> Dict[str, List[str]]`
     Returns {receiving_node: [keys that would move to it]}

5. The ring should maintain sorted positions for O(log n) lookups using bisect

**ALLOWED IMPORTS:** hashlib, bisect

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests including distribution analysis
- rationale: Explain how virtual nodes improve distribution
""",
        "constraints": {
            "allowed_imports": ["hashlib", "bisect"]
        }
    },
    {
        "id": "task-020",
        "title": "MVCC Transaction Manager",
        "description": """
Implement Multi-Version Concurrency Control (MVCC) for a key-value store:

1. Create version tracking:
   - `Version` dataclass: value, created_txn_id, expired_txn_id (None if current)
   - Each key maintains a list of versions

2. Create `Transaction` class:
   - `txn_id: int` - Unique, monotonically increasing
   - `start_timestamp: int` - Snapshot point
   - `status: str` - ACTIVE, COMMITTED, ABORTED
   - `read_set: Dict[str, int]` - Keys read and their version txn_ids
   - `write_set: Dict[str, Any]` - Pending writes

3. Create `MVCCStore` class:
   - `begin_transaction(self) -> Transaction`
   - `read(self, txn: Transaction, key: str) -> Optional[Any]` - Snapshot isolation read
   - `write(self, txn: Transaction, key: str, value: Any)` - Buffer in write_set
   - `commit(self, txn: Transaction) -> bool` - Validate and commit
   - `abort(self, txn: Transaction)` - Rollback transaction
   - `gc(self)` - Garbage collect old versions no longer visible

4. Snapshot isolation rules:
   - Read sees versions where: created_txn_id < txn.start_timestamp AND
     (expired_txn_id is None OR expired_txn_id > txn.start_timestamp)
   - On commit: check no write-write conflicts (another txn modified same key)
   - Create new versions for writes, expire old versions

5. Implement conflict detection:
   - `_check_write_conflicts(self, txn: Transaction) -> bool`
   - Return False if any key in write_set was modified by another committed txn since start

6. Properties:
   - `active_transactions` - List of active transaction IDs
   - `oldest_active_txn` - Oldest active transaction ID (for GC boundary)

Provide your response as JSON with:
- sourceCode: Your implementation
- testCode: Unit tests for concurrent transactions and conflict detection
- rationale: Explain snapshot isolation guarantees and write conflict handling
""",
        "constraints": {
            "allowed_imports": ["dataclasses", "typing", "threading", "time"],
            "require_thread_safety": True
        }
    }
]
