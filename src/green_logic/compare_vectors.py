import numpy as np
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine

class VectorScorer:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        initializes the vector scorer with a lightweight model by default.
        """
        print(f"[VectorScorer] loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)

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
