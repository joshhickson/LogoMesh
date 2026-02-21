import numpy as np
from sentence_transformers import SentenceTransformer
from functools import lru_cache
from scipy.spatial.distance import cosine
from threading import Lock

# constants (added here, as there is no global constant file available)
LRU_CACHE_MAXSIZE = 1024 # max number of cached embeddings 


class VectorScorerMeta(type):
    """A thread-safe singleton metaclass for VectorScorer, to ensure only one model instance is loaded in memory"""
    _instances: dict = {} # dict to hold the instances of classes 

    _lock: Lock = Lock() # define a lock for thread safety

    def __call__(cls, *args, **kwargs):
        with cls._lock:  # only one thread creates an instance at a time
            if cls not in cls._instances: # if instance does not exist, create it
                instance = super().__call__(*args, **kwargs)
                cls._instances[cls] = instance # store the instance in the dict
        return cls._instances[cls]


class VectorScorer(metaclass=VectorScorerMeta):

    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        initializes the vector scorer with a lightweight model by default.
        """
        print(f"[VectorScorer] loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)

    @lru_cache(maxsize=LRU_CACHE_MAXSIZE)
    def get_embedding(self, text: str):
        """generates an embedding vector for the given text."""
        return self.model.encode(text)

    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        calculates cosine similarity between two pieces of text.
        returns a score between 0 and 1.
        """
        if not text1 or not text2:
            return 0.0
            
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)
        
        # cosine distance is 1 - cosine similarity
        # similarity = 1 - distance
        similarity = 1 - cosine(emb1, emb2)
        
        # handle potential floating point issues (clamping to 0-1)
        return float(max(0.0, min(1.0, similarity)))

def compare_texts(text1: str, text2: str) -> float:
    """convenience function for one-off comparisons."""
    scorer = VectorScorer()
    return scorer.calculate_similarity(text1, text2)
