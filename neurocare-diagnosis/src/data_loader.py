import pandas as pd
from pathlib import Path

def load_participants(data_dir):
    participants_path = Path(data_dir) / "participants.tsv"
    df = pd.read_csv(participants_path, sep="\t")

    label_map = {"A": 0, "F": 1, "C": 2}
    df["label"] = df["Group"].map(label_map)

    return df[["participant_id", "label"]]

import mne

def load_eeg_file(file_path):
    raw = mne.io.read_raw_eeglab(file_path, preload=True)
    return raw
