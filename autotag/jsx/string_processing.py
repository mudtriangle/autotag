# External libraries
import re
import unicodedata

import nltk
from nltk.tokenize import word_tokenize
from nltk.stem.isri import ISRIStemmer
from nltk.stem.snowball import SnowballStemmer
from nltk.corpus import stopwords

import pickle as pkl


# Takes a string with special characters and returns a string only with English letters.
def strip_accents(original_string):
    return str(unicodedata.normalize('NFD', original_string).encode('ascii', 'ignore').decode("utf-8"))


# Get rid of punctuation and special characters from a string.
def normalize(original_string):
    return re.sub(r'[^\w\s]', ' ', original_string.strip().lower())


# Takes a normalized string and returns the relevant stemmed tokens for that string.
def tokenize(clean_string, lang):
    with open('stop_words/' + lang + '.pkl', 'rb') as f:
        stop_words = pkl.load(f)

    stemmer = SnowballStemmer(lang)

    words = nltk.word_tokenize(clean_string)
    tokens = []
    for word in words:
        # Ignore stop words.
        if word in stop_words:
            continue

        # Ignore numbers.
        if not word.isalpha():
            continue

        tokens.append(stemmer.stem(word))

    return tokens


def get_ngrams(tokens, n):
    return list(zip(*[tokens[i:] for i in range(n)]))
