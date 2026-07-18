"""
app/ml/inference.py
Utility: save prediction + probability CSVs to results/inference/.
Imported by the predict blueprint — no Flask dependency here.
"""

import os
import csv
import numpy as np
from datetime import datetime

RESULTS_DIR = os.path.join("results", "inference")
os.makedirs(RESULTS_DIR, exist_ok=True)


def save_results(predictions: list, probs: np.ndarray):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # predictions CSV
    with open(os.path.join(RESULTS_DIR, f"predictions_{timestamp}.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["sample", "predicted_class", "confidence"])
        for i, p in enumerate(predictions):
            w.writerow([i, p["class"], f"{p['confidence']:.4f}"])

    # probabilities CSV
    with open(os.path.join(RESULTS_DIR, f"probabilities_{timestamp}.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["sample", "prob_ADFTD", "prob_CN"])
        for i, row in enumerate(probs):
            w.writerow([i] + [f"{v:.4f}" for v in row])