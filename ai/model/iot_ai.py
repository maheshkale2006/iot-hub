import re
import math
import json

from collections import Counter


class IoTAI:

    def __init__(self, training_file):

        self.intents = {}

        self.vocabulary = set()

        self.idf = {}

        self.intent_vectors = {}

        self.load_training_data(
            training_file
        )

        self.train()

    # ========================================================
    # TOKENIZATION
    # ========================================================

    def tokenize(self, text):

        text = text.lower()

        return re.findall(
            r"[a-zA-Z0-9]+",
            text
        )

    # ========================================================
    # TERM FREQUENCY
    # ========================================================

    def term_frequency(self, words):

        counter = Counter(words)

        total = len(words)

        if total == 0:

            return {}

        return {
            word: count / total
            for word, count
            in counter.items()
        }

    # ========================================================
    # LOAD TRAINING DATA
    # ========================================================

    def load_training_data(
        self,
        training_file
    ):

        with open(
            training_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        for intent in data["intents"]:

            name = intent["name"]

            examples = intent[
                "examples"
            ]

            self.intents[name] = examples

            for example in examples:

                words = self.tokenize(
                    example
                )

                self.vocabulary.update(
                    words
                )

    # ========================================================
    # TRAIN
    # ========================================================

    def train(self):

        documents = []

        for examples in (
            self.intents.values()
        ):

            for example in examples:

                words = self.tokenize(
                    example
                )

                documents.append(
                    set(words)
                )

        total_documents = len(
            documents
        )

        # ----------------------------------------------
        # IDF
        # ----------------------------------------------

        for word in self.vocabulary:

            document_count = sum(
                1
                for document in documents
                if word in document
            )

            self.idf[word] = (
                math.log(
                    (total_documents + 1)
                    /
                    (document_count + 1)
                )
                + 1
            )

        # ----------------------------------------------
        # INTENT VECTORS
        # ----------------------------------------------

        for intent, examples in (
            self.intents.items()
        ):

            vectors = []

            for example in examples:

                vectors.append(
                    self.vectorize(
                        example
                    )
                )

            self.intent_vectors[
                intent
            ] = vectors

    # ========================================================
    # VECTORIZE
    # ========================================================

    def vectorize(self, text):

        words = self.tokenize(text)

        tf = self.term_frequency(
            words
        )

        vector = {}

        for word in self.vocabulary:

            vector[word] = (
                tf.get(
                    word,
                    0
                )
                *
                self.idf.get(
                    word,
                    1
                )
            )

        return vector

    # ========================================================
    # COSINE SIMILARITY
    # ========================================================

    def cosine_similarity(
        self,
        vector_a,
        vector_b
    ):

        numerator = 0

        magnitude_a = 0

        magnitude_b = 0

        for word in self.vocabulary:

            a = vector_a.get(
                word,
                0
            )

            b = vector_b.get(
                word,
                0
            )

            numerator += a * b

            magnitude_a += a * a

            magnitude_b += b * b

        magnitude_a = math.sqrt(
            magnitude_a
        )

        magnitude_b = math.sqrt(
            magnitude_b
        )

        if (
            magnitude_a == 0
            or magnitude_b == 0
        ):

            return 0

        return (
            numerator
            /
            (
                magnitude_a
                *
                magnitude_b
            )
        )

    # ========================================================
    # PREDICT
    # ========================================================

    def predict(self, text):

        query_vector = self.vectorize(
            text
        )

        best_intent = None

        best_score = 0

        for (
            intent,
            vectors
        ) in self.intent_vectors.items():

            for vector in vectors:

                score = (
                    self.cosine_similarity(
                        query_vector,
                        vector
                    )
                )

                if score > best_score:

                    best_score = score

                    best_intent = intent

        return {
            "intent": best_intent,
            "confidence": round(
                best_score,
                4
            )
        }