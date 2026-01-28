
# --- BANK ACCOUNT GOLDEN SAMPLE (Event Sourcing) ---
BANK_GOLDEN_CODE = """
from dataclasses import dataclass
from typing import List, Any, Optional

@dataclass
class Event:
    event_type: str
    data: dict
    version: int

class EventStore:
    def __init__(self):
        self.streams = {}

    def append(self, stream_id: str, events: List[Event], expected_version: int):
        current_stream = self.streams.get(stream_id, [])
        current_version = len(current_stream)

        # CRITICAL: Optimistic Concurrency Control
        if current_version != expected_version:
            raise Exception(f"ConcurrencyError: Expected v{expected_version}, but stream is at v{current_version}")

        self.streams[stream_id] = current_stream + events

class BankAccount:
    def __init__(self, event_store):
        self.store = event_store
        self.balance = 0
        self.version = 0

    def withdraw(self, amount: int):
        if self.balance < amount:
            raise Exception("Insufficient funds")

        event = Event("MoneyWithdrawn", {"amount": amount}, self.version + 1)
        # Pass current version to ensure no race condition
        self.store.append("acc-123", [event], self.version)
"""

BANK_GOLDEN_RATIONALE = """
I implemented the Event Store with strict Optimistic Concurrency Control (OCC).
The `expected_version` check is mandatory to prevent race conditions (e.g., double spending) in a distributed environment.
Business logic (balance check) is performed *before* event creation, and the state is only updated if the append succeeds.
"""

# --- BANK ACCOUNT LAZY SAMPLE (Contextual Debt) ---
BANK_LAZY_CODE = BANK_GOLDEN_CODE

BANK_LAZY_RATIONALE = "Implemented bank account with event sourcing."

# --- BANK ACCOUNT VULNERABLE SAMPLE (Liability) ---
BANK_VULNERABLE_CODE = """
from dataclasses import dataclass
from typing import List

@dataclass
class Event:
    event_type: str
    data: dict

class EventStore:
    def __init__(self):
        self.streams = {}

    def append(self, stream_id: str, events: List[Event]):
        # VULNERABILITY: Removed version check to "simplify" integration
        # This allows Race Conditions (Double Spend)
        current = self.streams.get(stream_id, [])
        self.streams[stream_id] = current + events

class BankAccount:
    def __init__(self, event_store):
        self.store = event_store
        self.balance = 0

    def withdraw(self, amount: int):
        # Even if we check balance here, another thread could withdraw
        # before we append, because append() no longer locks/checks version.
        if self.balance >= amount:
            self.store.append("acc-123", [Event("MoneyWithdrawn", {"amount": amount})])
"""

BANK_VULNERABLE_RATIONALE = "Simplified the event store by removing version tracking. It was causing too many errors."

# --- LEGACY PAYLOADS (Keep for reference) ---
ERC20_GOLDEN_CODE = "..." # (Truncated for brevity, normally would keep)
# We strictly overwrite this file to focus on the Bank Demo
GOLDEN_CODE = BANK_GOLDEN_CODE
GOLDEN_RATIONALE = BANK_GOLDEN_RATIONALE
LAZY_CODE = BANK_LAZY_CODE
LAZY_RATIONALE = BANK_LAZY_RATIONALE
VULNERABLE_CODE = BANK_VULNERABLE_CODE
VULNERABLE_RATIONALE = BANK_VULNERABLE_RATIONALE
