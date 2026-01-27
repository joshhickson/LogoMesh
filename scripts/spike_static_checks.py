
import sys
import os
import importlib.util

# Helper to import file directly
def import_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

# Import dependency_analyzer directly to avoid 'a2a' dependency in __init__
dep_analyzer = import_from_path(
    "dependency_analyzer",
    os.path.join(os.getcwd(), "src/red_logic/dependency_analyzer.py")
)

# Import generator directly
generator = import_from_path(
    "generator",
    os.path.join(os.getcwd(), "src/green_logic/generator.py")
)

from tests.demo_payloads import VULNERABLE_CODE, GOLDEN_CODE

def test_red_agent_detection():
    print("--- Testing Red Agent Static Analysis ---")
    findings = dep_analyzer.analyze_dependencies(VULNERABLE_CODE)

    critical_found = False
    for f in findings:
        print(f"[{f.risk_level.name}] {f.title}: {f.description}")
        if f.risk_level == dep_analyzer.RiskLevel.CRITICAL and "subprocess.run" in f.title:
            critical_found = True

    if critical_found:
        print("SUCCESS: Red Agent detected command injection.")
    else:
        print("FAILURE: Red Agent missed the vulnerability.")
        sys.exit(1)

def test_fuzzer_generation():
    print("\n--- Testing Programmatic Fuzzer ---")
    fuzz_tests = generator.generate_fuzz_tests(GOLDEN_CODE)

    if "class TestFuzzEdgeCases" in fuzz_tests:
        print("SUCCESS: Fuzzer generated test class.")
        # Check for specific edge cases
        if "test_lrucache_empty_init" in fuzz_tests:
            print("  - Found empty init test")
        if "test_lrucache_get_fuzz" in fuzz_tests:
            print("  - Found fuzzing for 'get' method")
    else:
        print("FAILURE: Fuzzer failed to generate tests.")
        print("Output:", fuzz_tests)
        sys.exit(1)

if __name__ == "__main__":
    test_red_agent_detection()
    test_fuzzer_generation()
