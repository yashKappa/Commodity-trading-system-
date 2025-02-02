def overlapping(list1, list2):
    c = 0
    d = 0
    for i in list1:
        c += 1
    for i in list2:
        d += 1
    for i in range(0, c):
        for j in range(0, d):
            if list1[i] == list2[j]:
                return 1
    return 0

# First case: no overlapping elements
list1 = [1, 2, 3, 4, 5]
list2 = [6, 7, 8, 9]
if overlapping(list1, list2):
    print("overlapping")
else:
    print("not overlapping")

# Second case: overlapping elements
list1 = [1, 2, 3, 4, 5]
list2 = [4, 6, 7, 8, 9]
if overlapping(list1, list2):
    print("overlapping")
else:
    print("not overlapping")
