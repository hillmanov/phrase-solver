import sys
import os
import sqlite3
import psycopg2
import re
from collections import defaultdict

import nltk
nltk.download("punkt")
nltk.download("movie_reviews")
nltk.download("brown")
nltk.download("treebank")
nltk.download("movie_reviews")
nltk.download("words")
nltk.download("wordnet")
nltk.download("abc")
nltk.download("genesis")

from nltk.corpus import brown, treebank, movie_reviews, words as words_list, wordnet, abc, genesis

conn = psycopg2.connect("host=db port=5432 user=phrase_solver password=phrase_solver")
# conn = sqlite3.connect('./wofkov_db.sqlite')
c = conn.cursor()

with open('./initDb.sql', 'r') as sql:
    commands = sql.read().split(';')
    for command in commands:
        if command.strip():
            print('Here is the command:')
            print(command.strip())
            c.execute(command.strip() + ";")

conn.commit();

# corpuses = [brown, treebank, movie_reviews, words_list, wordnet, abc, genesis]
corpuses = [brown]

def cleanWordList(wordList):
    return [w.lower().replace("'", '') for w in wordList if w.isalpha() and w.strip() not in ("''", "'")]

print ("Building clean words list...")
words = [word for wordList in [cleanWordList(corpus.words()) for corpus in corpuses] for word in wordList]

print("Building clean sentences list")
sentences = [cleanWordList(s) for s in [corpus.sents() for corpus in corpuses if hasattr(corpus, 'sents')] for s in s]

print(words[:5])
print(sentences[:5])

def singles(words):
        if len(words) < 1:
            return
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
        for i in range(len(s) - 3):
            yield (s[i], s[i + 1], s[i + 2])

print("Building wofkov models...")
unigrams = defaultdict(int)
for w in singles(words):
    unigrams[w] += 1

bigrams = defaultdict(int)
for w1, w2 in doubles(sentences):
    bigrams[':'.join([w1, w2])] += 1

trigrams = defaultdict(int)
for w1, w2, w3 in triples(sentences):
    trigrams[':'.join([w1, w2, w3])] += 1

for word, frequency in unigrams.items():
    try:
        c.execute("INSERT INTO unigram (word, frequency) VALUES (%s, %s)", (word, frequency))
    except:
        pass

for context_word, frequency in bigrams.items():
    try:
        context, word = context_word.split(":")
        c.execute("INSERT INTO bigram (context, word, frequency) VALUES (%s, %s, %s)", (context, word, frequency))
    except:
        pass

for contexts_word, frequency in trigrams.items():
    try:
        context_1, context_2, word = contexts_word.split(":")
        c.execute("INSERT INTO trigram (context_1, context_2, word, frequency) VALUES (%s, %s, %s, %s)", (context_1, context_2, word, frequency))
    except:
        pass

print("Committing to the DB")
conn.commit()
print("Done!")
