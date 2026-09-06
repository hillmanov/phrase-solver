import os
from collections import defaultdict

import psycopg2
from psycopg2.extras import execute_values

import nltk
nltk.download("punkt")
nltk.download("punkt_tab")
nltk.download("movie_reviews")
nltk.download("brown")
nltk.download("treebank")
nltk.download("words")
nltk.download("wordnet")
nltk.download("abc")
nltk.download("genesis")

from nltk.corpus import brown, treebank, movie_reviews, words as words_list, wordnet, abc, genesis

conn = psycopg2.connect(
    host=os.environ.get("PGHOST", "localhost"),
    port=os.environ.get("PGPORT", 5433),
    user="phrase_solver",
    password="phrase_solver",
    dbname="phrase_solver",
)
c = conn.cursor()

with open('./initDb.sql', 'r') as sql:
    for command in sql.read().split(';'):
        if command.strip():
            c.execute(command.strip() + ";")

conn.commit()

corpuses = [brown, treebank, movie_reviews, words_list, wordnet, abc, genesis]

def cleanWordList(wordList):
    return [w.lower().replace("'", '') for w in wordList if w.isalpha() and w.strip() not in ("''", "'")]

print("Building clean words list...")
words = [word for wordList in [cleanWordList(corpus.words()) for corpus in corpuses] for word in wordList]

print("Building clean sentences list...")
sentences = [cleanWordList(s) for s in [corpus.sents() for corpus in corpuses if hasattr(corpus, 'sents')] for s in s]

def singles(words):
    for w in words:
        yield w

def doubles(sentences):
    for s in sentences:
        if len(s) < 2:
            continue
        for i in range(len(s) - 1):
            yield (s[i], s[i + 1])

def triples(sentences):
    for s in sentences:
        if len(s) < 3:
            continue
        for i in range(len(s) - 2):
            yield (s[i], s[i + 1], s[i + 2])

print("Building wofkov models...")
unigrams = defaultdict(int)
for w in singles(words):
    unigrams[w] += 1

bigrams = defaultdict(int)
for w1, w2 in doubles(sentences):
    bigrams[w1, w2] += 1

trigrams = defaultdict(int)
for w1, w2, w3 in triples(sentences):
    trigrams[w1, w2, w3] += 1

print(f"{len(unigrams)} unigrams, {len(bigrams)} bigrams, {len(trigrams)} trigrams")

print("Inserting...")
execute_values(c, "INSERT INTO unigram (word, frequency) VALUES %s",
               list(unigrams.items()), page_size=10000)
execute_values(c, "INSERT INTO bigram (context, word, frequency) VALUES %s",
               [(w1, w2, f) for (w1, w2), f in bigrams.items()], page_size=10000)
execute_values(c, "INSERT INTO trigram (context_1, context_2, word, frequency) VALUES %s",
               [(w1, w2, w3, f) for (w1, w2, w3), f in trigrams.items()], page_size=10000)

print("Committing to the DB")
conn.commit()
print("Done!")
