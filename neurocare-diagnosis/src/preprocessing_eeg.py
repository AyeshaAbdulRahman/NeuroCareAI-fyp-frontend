# import numpy as np

# def create_windows(raw, window_sec=2):
#     sfreq = raw.info["sfreq"]
#     samples = int(window_sec * sfreq)

#     data = raw.get_data()

#     windows = []
#     for start in range(0, data.shape[1] - samples, samples):
#         segment = data[:, start:start+samples]
#         windows.append(segment)

#     return np.array(windows)
















# import os
# import mne

# # Base dataset folder
# BASE_DATASET_PATH = r"C:\Users\97150\OneDrive\Desktop\DLP Module\ds004504\derivatives"

# # Function to find all .set files in derivatives folder
# def find_all_set_files(base_path):
#     set_files = []
#     for root, dirs, files in os.walk(base_path):
#         for file in files:
#             if file.endswith("_task-eyeclosed_eeg.set"):
#                 set_files.append(os.path.join(root, file))
#     return set_files

# # Function to load one EEG file
# def load_eeg(file_path):
#     print(f"Loading EEG file:\n{file_path}\n")
#     raw = mne.io.read_raw_eeglab(file_path, preload=True)
#     print("EEG Info:")
#     print(raw.info)
#     return raw

# if __name__ == "__main__":
#     eeg_files = find_all_set_files(BASE_DATASET_PATH)
    
#     if not eeg_files:
#         print("No .set files found. Check dataset path.")
#     else:
#         # Load first file as a test
#         raw = load_eeg(eeg_files[0])
#         raw.plot(n_channels=19, scalings='auto')





# import os

# BASE_DATASET_PATH = r"C:\Users\97150\OneDrive\Desktop\DLP Module\ds004504\derivatives"

# for root, dirs, files in os.walk(BASE_DATASET_PATH):
#     for file in files:
#         if file.endswith("_task-eyeclosed_eeg.set"):
#             print(os.path.join(root, file))

import os
import mne
import numpy as np

# ---------------------------
# 1. Dataset Path
# ---------------------------
BASE_DATASET_PATH = r"C:\Users\97150\OneDrive\Desktop\DLP Module\ds004504\derivatives"

# ---------------------------
# 2. Find all EEG .set files
# ---------------------------
def find_eeg_files(base_path):
    eeg_files = []
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith("_task-eyesclosed_eeg.set"):
                eeg_files.append(os.path.join(root, file))
    return eeg_files

eeg_files = find_eeg_files(BASE_DATASET_PATH)
print(f"Found {len(eeg_files)} EEG files")

# ---------------------------
# 3. EEG Preprocessing Function
# ---------------------------
def preprocess_eeg(file_path, window_sec=2):
    # Load raw EEG
    raw = mne.io.read_raw_eeglab(file_path, preload=True)
    
    # Set standard montage
    montage = mne.channels.make_standard_montage('standard_1020')
    raw.set_montage(montage)
    
    # Band-pass filter: 1-50 Hz
    raw.filter(l_freq=1., h_freq=50., fir_design='firwin')
    
    # Re-reference to average
    raw.set_eeg_reference('average')
    
    # Create windows
    sfreq = int(raw.info['sfreq'])
    samples = int(window_sec * sfreq)
    data = raw.get_data()
    
    windows = []
    for start in range(0, data.shape[1]-samples, samples):
        segment = data[:, start:start+samples]
        windows.append(segment)
    
    windows = np.array(windows)
    
    # Normalize windows (Z-score per channel)
    windows = (windows - windows.mean(axis=2, keepdims=True)) / windows.std(axis=2, keepdims=True)
    
    return windows

# ---------------------------
# 4. Loop over all files and preprocess
# ---------------------------
all_windows = []

for f in eeg_files:
    print(f"Preprocessing: {f}")
    windows = preprocess_eeg(f)
    all_windows.append(windows)

# Concatenate all subjects
all_windows = np.concatenate(all_windows, axis=0)
print(f"Total windows shape: {all_windows.shape}")  # (total_windows, channels, samples)

# ---------------------------
# 5. Save preprocessed dataset
# ---------------------------
np.save("eeg_windows_v1.npy", all_windows)
print("Preprocessed EEG dataset saved as eeg_windows_v1.npy")
