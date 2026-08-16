"""
AETSH-69 AI Knowledge Retriever — Training & Evaluation Notebook
================================================================
This script demonstrates the Scikit-Learn TF-IDF training process
for the AETSH-69 AI knowledge retriever.

To use in Jupyter:
    1. Copy this file to a .ipynb notebook
    2. Run cells sequentially
    3. Evaluate sample queries and view retrieval scores

Requirements: scikit-learn, numpy, matplotlib (optional for visualization)
"""

# === CELL 1: Imports ===
import os
import glob
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# import matplotlib.pyplot as plt  # Uncomment for visualizations

# === CELL 2: Load Knowledge Base ===
KNOWLEDGE_DIR = "../knowledge"
md_files = sorted(glob.glob(os.path.join(KNOWLEDGE_DIR, "*.md")))

documents = []
doc_titles = []

for filepath in md_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    title = os.path.basename(filepath).replace('.md', '').replace('_', ' ').title()
    documents.append(content)
    doc_titles.append(title)
    print(f"  Loaded: {title}")

print(f"\nTotal documents loaded: {len(documents)}")

# === CELL 3: Train TF-IDF Vectorizer ===
vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words='english',
    ngram_range=(1, 2),
    min_df=1,
    max_df=0.95,
    sublinear_tf=True
)

tfidf_matrix = vectorizer.fit_transform(documents)
vocabulary = vectorizer.vocabulary_

print(f"TF-IDF training complete!")
print(f"  Documents: {len(documents)}")
print(f"  Vocabulary size: {len(vocabulary)}")
print(f"  Matrix shape: {tfidf_matrix.shape}")

# === CELL 4: Test Sample Queries ===
sample_queries = [
    "What is Mark's educational background and attachment objective?",
    "How much does a FireStick cost?",
    "What services do you offer for CCTV installation?",
    "What games are available in the arcade?",
    "What is SmartShamba and how does it work?",
    "What are the membership tiers and prices?",
    "What security measures are implemented in AETSH-69?",
    "How do I contact Mark?",
]

print("=" * 80)
print("QUERY EVALUATION RESULTS")
print("=" * 80)

for query in sample_queries:
    query_vec = vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    top_indices = np.argsort(similarities)[::-1][:3]
    
    print(f"\nQuery: '{query}'")
    print(f"  Top matches:")
    for idx in top_indices:
        if similarities[idx] > 0.03:
            print(f"    {doc_titles[idx]} (Score: {similarities[idx]:.4f})")
        else:
            print(f"    (No strong match above threshold)")

# === CELL 5: Visualize Similarity Matrix (Optional) ===
# Uncomment to visualize:
# fig, ax = plt.subplots(figsize=(12, 8))
# all_text = documents + sample_queries
# all_vec = vectorizer.transform(all_text)
# sim_matrix = cosine_similarity(all_vec)
# im = ax.imshow(sim_matrix, cmap='YlOrRd')
# ax.set_xticks(range(len(all_text)))
# ax.set_yticks(range(len(all_text)))
# ax.set_xticklabels(doc_titles + [f"Q{i+1}" for i in range(len(sample_queries))], rotation=90, fontsize=8)
# ax.set_yticklabels(doc_titles + [f"Q{i+1}" for i in range(len(sample_queries))], fontsize=8)
# plt.colorbar(im)
# plt.title("TF-IDF Cosine Similarity Matrix: Knowledge Base + Queries")
# plt.tight_layout()
# plt.savefig('similarity_matrix.png', dpi=150)
# plt.show()

# === CELL 6: Retriever Statistics ===
print("\n" + "=" * 80)
print("RETRIEVER STATISTICS")
print("=" * 80)
print(f"  Knowledge directory: {KNOWLEDGE_DIR}")
print(f"  Documents loaded: {len(documents)}")
print(f"  Vocabulary size: {len(vocabulary)}")
print(f"  TF-IDF matrix shape: {tfidf_matrix.shape}")
print(f"  Top 10 most important terms:")
feature_names = vectorizer.get_feature_names_out()
sums = tfidf_matrix.sum(axis=0).A1
top_terms = np.argsort(sums)[::-1][:10]
for i, term_idx in enumerate(top_terms):
    print(f"    {i+1}. '{feature_names[term_idx]}' (sum TF-IDF: {sums[term_idx]:.4f})")
