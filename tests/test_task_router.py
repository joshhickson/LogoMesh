import pytest
from src.purple_logic.router import TaskRouter

def test_task_router():
    router = TaskRouter()
    
    # 1. Standard Track Tests
    assert router.classify("Find the SQL injection vulnerability") == "security"
    assert router.classify("Select * from users") == "data_sql"
    assert router.classify("Configure the BGP firewall router") == "networking"
    assert router.classify("Click the submit button on the UI") == "computer_use"
    assert router.classify("Call the weather API using a tool") == "tool_using"
    assert router.classify("Retrieve documents to answer this question") == "rag"
    assert router.classify("Write a python function") == "coding"
    assert router.classify("CODING TASK: LRU Cache") == "coding"
    assert router.classify("Do something else") == "generic"
    assert router.classify("") == "generic"

    # 2. Complex/Real-world Phrasing Tests
    assert router.classify("I need you to automate my browser to navigate to amazon and buy a book") == "computer_use"
    assert router.classify("Can you write a React component that fetches data from an endpoint and renders it JSON?") == "coding"
    assert router.classify("We have a table called 'transactions', please write a schema migration to add a boolean column.") == "data_sql"
    assert router.classify("Please review this code for any missing authentication checks or CSRF payloads.") == "security"
    assert router.classify("I need an active document synthesis of the provided company transcript.") == "rag"
    assert router.classify("Use the search_web webhook to find the current stock price.") == "tool_using"
    
    # 3. Edge Cases / Adversarial Inputs
    # Mixed keywords (should rely on semantic score if VectorScorer is present, else priority order in heuristics)
    # The heuristic priority is Security > Networking > Computer Use > Tool Using > RAG > Data/SQL > Coding
    assert router.classify("Write a python script to exploit the sql injection vulnerability.") == "security" # Security wins priority over coding/sql in regex
    
    # Strange capitalization and punctuation
    assert router.classify("cOdInG tAsK: build a jSoN pArSeR!!!") == "coding"
    
    # Empty or null-like inputs
    assert router.classify("    ") == "generic"
    assert router.classify(None) == "generic"
    
    # Number-heavy or log-like inputs
    assert router.classify("192.168.1.1 255.255.255.0 dns timeout error tcp/ip") == "networking"
