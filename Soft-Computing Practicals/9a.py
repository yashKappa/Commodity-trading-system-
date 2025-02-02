from fuzzywuzzy import fuzz
from fuzzywuzzy import process
s1 = "I love fuzzysforfuzzys"
s2 = "I am loving fuzzysforfuzzys"
print("FuzzyWuzzy Ratio:", fuzz.ratio(s1, s2))
print("FuzzyWuzzy Partial Ratio:", fuzz.partial_ratio(s1, s2))
print("FuzzyWuzzy Token Sort Ratio:", fuzz.token_sort_ratio(s1, s2))
print("FuzzyWuzzy Token Set Ratio:", fuzz.token_set_ratio(s1, s2))
print("FuzzyWuzzy W Ratio:", fuzz.WRatio(s1, s2), '\n\n')
query = 'fuzzys for fuzzys'
choices = ['fuzzy for fuzzy', 'fuzzy fuzzy', 'g. for fuzzys']
print("List of ratios:")
print(process.extract(query, choices), '\n')
print("Best among the above list:", process.extractOne(query, choices))
