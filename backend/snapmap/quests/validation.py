from transformers import pipeline

clf = pipeline("zero-shot-image-classification",
               model="philschmid/clip-zero-shot-image-classification")

res = clf("test.jpg", candidate_labels=["a photo of a goat", "a photo of an person", "a photo of a dog", "none of the above"])

print(res)