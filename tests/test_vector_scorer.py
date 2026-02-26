"""
Mock tests for VectorScorer (green_logic/compare_vectors.py).
SentenceTransformer is mocked so tests run without model files.
"""

import threading
from unittest.mock import patch
import numpy as np
import pytest

from green_logic.compare_vectors import VectorScorer, VectorScorerMeta, compare_texts


@pytest.fixture(autouse=True)
def reset_scorer_state():
    yield # run the test first, and then clear the class state for isolation
    VectorScorerMeta._instances.clear()


@pytest.fixture
def mock_transformer():
    with patch("green_logic.compare_vectors.SentenceTransformer") as m:
        m.return_value.encode.return_value = np.array([1.0, 0.0, 0.0])
        yield m


def test_multiple_instantiations_return_same_scorer(mock_transformer):
    first_scorer = VectorScorer()
    second_scorer = VectorScorer()
    assert first_scorer is second_scorer


def test_embedding_cache_skips_recompute(mock_transformer):
    vector_engine = VectorScorer()
    query = "this is test query"
    vector_engine.get_embedding(query)
    vector_engine.get_embedding(query)
    mock_transformer.return_value.encode.assert_called_once_with(query)


def test_concurrent_scorer_access(mock_transformer):
    collected_scorer_refs = []

    def fetch_engine():
        collected_scorer_refs.append(VectorScorer())

    threads = [threading.Thread(target=fetch_engine) for _ in range(20)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert len({id(ref) for ref in collected_scorer_refs}) == 1


def test_text_similarity_reuses_model(mock_transformer):
    compare_texts("security bug", "security vulnerability")
    compare_texts("codeql", "semgrep")
    mock_transformer.assert_called_once()
