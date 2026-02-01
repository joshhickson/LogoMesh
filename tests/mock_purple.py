import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# Pre-canned bad responses
BAD_LOOP_RESPONSE = {
    "sourceCode": "def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",
    "testCode": "",
    "rationale": "I used a for loop because it is faster."
}

BROKEN_LOGIC_RESPONSE = {
    "sourceCode": "def fibonacci(n):\n    return n + 1  # Broken code",
    "testCode": "",
    "rationale": "I think this works."
}

BAD_RATIONALE_RESPONSE = {
    "sourceCode": "def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)",
    "testCode": "",
    "rationale": "I like pizza and video games."
}

GOOD_RESPONSE = {
    "sourceCode": "def fibonacci(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)\n    return memo[n]",
    "testCode": "",
    "rationale": "Standard recursive solution with memoization."
}

@app.post("/")
async def mock_purple_agent(request: Request):
    data = await request.json()
    battle_id = data.get("id", "")
    
    response_content = GOOD_RESPONSE
    
    if "bad_loop" in battle_id:
        response_content = BAD_LOOP_RESPONSE
    elif "broken_logic" in battle_id:
        response_content = BROKEN_LOGIC_RESPONSE
    elif "bad_rationale" in battle_id:
        response_content = BAD_RATIONALE_RESPONSE
        
    return {
        "jsonrpc": "2.0",
        "id": battle_id,
        "result": {
            "status": {
                "message": {
                    "parts": [
                        {"text": str(response_content).replace("'", '"')}
                    ]
                }
            }
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9002)

