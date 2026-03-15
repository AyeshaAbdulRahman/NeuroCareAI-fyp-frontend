import matplotlib
matplotlib.use('TkAgg')  # Use Tkinter backend instead of inline

import mne
import os
import matplotlib.pyplot as plt

eeg_file = r"C:\Users\Softxone\Desktop\AyeshaWork\WebDev\react\neurocare-ai\neurocare-diagnosis\ds004504\sub-055\eeg\sub-055_task-eyesclosed_eeg.set"

raw = mne.io.read_raw_eeglab(eeg_file, preload=True)
print(raw.info)

# Plot and show
raw.plot(n_channels=19, scalings='auto')
plt.show()