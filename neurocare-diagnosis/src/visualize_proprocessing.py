# # import mne
# # import matplotlib.pyplot as plt
# # import glob
# # import numpy as np
# # from matplotlib.backends.backend_pdf import PdfPages

# # # --- Paths ---
# # eeg_folder = r"C:\Users\97150\OneDrive\Desktop\DLP Module\ds004504\derivatives"
# # eeg_files = glob.glob(eeg_folder + r"\sub-*\eeg\*_task-eyesclosed_eeg.set")

# # preprocessed_file = r"C:\Users\97150\OneDrive\Desktop\DLP Module\src\eeg_windows_v1.npy"

# # output_pdf = r"C:\Users\97150\OneDrive\Desktop\DLP_EEG_Report_Before_After.pdf"
# # pdf = PdfPages(output_pdf)

# # # --- Load preprocessed data ---
# # eeg_preprocessed = np.load(preprocessed_file, allow_pickle=True)

# # for idx, file_path in enumerate(eeg_files):
# #     subject_id = file_path.split("\\")[-2]  # extract sub-XXX
# #     print(f"Processing {subject_id}")

# #     # --- RAW EEG ---
# #     raw = mne.io.read_raw_eeglab(file_path, preload=True)
# #     raw.set_montage('standard_1020')

# #     fig1 = raw.plot(show=False, scalings='auto', title=f"{subject_id} - Raw EEG")
# #     pdf.savefig(fig1)
# #     plt.close(fig1)

# #     fig2 = raw.plot_psd(fmax=60, average=True, show=False)
# #     fig2.suptitle(f"{subject_id} - Raw EEG PSD")
# #     pdf.savefig(fig2)
# #     plt.close(fig2)

# #     fig3 = raw.plot_psd_topomap(ch_type='eeg', fmin=8, fmax=12, normalize=True, show=False)
# #     pdf.savefig(fig3)
# #     plt.close(fig3)

# #     # --- Preprocessed EEG ---
# #     if idx < len(eeg_preprocessed):
# #         pre_data = eeg_preprocessed[idx]  # shape: channels x samples
# #         fig4, ax = plt.subplots(figsize=(12, 6))
# #         ax.plot(pre_data.T)
# #         ax.set_title(f"{subject_id} - Preprocessed EEG")
# #         ax.set_xlabel("Time Samples")
# #         ax.set_ylabel("Amplitude (uV)")
# #         pdf.savefig(fig4)
# #         plt.close(fig4)

# # pdf.close()
# # print(f"PDF report saved at: {output_pdf}")


# import numpy as np
# import mne
# import matplotlib.pyplot as plt
# from matplotlib.backends.backend_pdf import PdfPages

# # --- 1. Load preprocessed EEG ---
# preprocessed_file = r"C:\Users\97150\OneDrive\Desktop\DLP Module\src\eeg_windows_v1.npy"
# eeg_data = np.load(preprocessed_file, allow_pickle=True)  # shape: (n_channels, n_times)

# # Assuming standard 32-channel montage (you can adjust if different)
# ch_names = [
#     'Fp1','Fp2','F3','F4','C3','C4','P3','P4','O1','O2',
#     'F7','F8','T3','T4','T5','T6','Fz','Cz','Pz','Oz',
#     'FC1','FC2','CP1','CP2','FC5','FC6','CP5','CP6','POz','PO3','PO4','Iz'
# ]
# ch_types = ['eeg'] * len(ch_names)

# # Check if channel count matches
# n_channels, n_times = eeg_data.shape
# if n_channels != len(ch_names):
#     print(f"Warning: Number of channels in data ({n_channels}) != length of ch_names ({len(ch_names)})")
#     ch_names = [f"Ch{i+1}" for i in range(n_channels)]

# info = mne.create_info(ch_names=ch_names, sfreq=256, ch_types=ch_types)  # adjust sfreq if different
# raw = mne.io.RawArray(eeg_data, info)
# raw.set_montage('standard_1020')

# # --- 2. Create PDF ---
# output_pdf = r"C:\Users\97150\OneDrive\Desktop\DLP_Module_EEG_Report_Preprocessed.pdf"
# pdf = PdfPages(output_pdf)

# # --- 3. Raw-like Plot ---
# fig1 = raw.plot(show=False, scalings='auto', title="Preprocessed EEG - Raw-like")
# pdf.savefig(fig1)
# plt.close(fig1)

# # --- 4. Power Spectral Density (PSD) ---
# fig2 = raw.compute_psd(fmax=60).plot(average=True, show=False)
# fig2.suptitle("Preprocessed EEG - PSD")
# pdf.savefig(fig2)
# plt.close(fig2)

# # --- 5. Alpha Band Topomap (8-12 Hz) ---
# try:
#     psd = raw.compute_psd(fmin=8, fmax=12)
#     fig3 = psd.plot_topomap(show=False)
#     fig3.suptitle("Preprocessed EEG - Alpha Topomap (8-12 Hz)")
#     pdf.savefig(fig3)
#     plt.close(fig3)
# except Exception as e:
#     print(f"Topomap plotting skipped due to error: {e}")

# pdf.close()
# print(f"PDF report saved at: {output_pdf}")

# import numpy as np

# preprocessed_file = r"C:\Users\97150\OneDrive\Desktop\DLP Module\src\eeg_windows_v1.npy"

# eeg_data = np.load(preprocessed_file, allow_pickle=True)

# print(type(eeg_data))
# print(eeg_data.shape)

# # If it is a list of arrays (common in windowed data)
# if isinstance(eeg_data, np.ndarray) and eeg_data.ndim == 1 and isinstance(eeg_data[0], np.ndarray):
#     print("Detected list of windows. Converting to single array for visualization.")
#     # Take the first window as representative
#     eeg_data = eeg_data[0]

# print("Shape after adjustment:", eeg_data.shape)


# import numpy as np
# import matplotlib.pyplot as plt
# from matplotlib.backends.backend_pdf import PdfPages
# import mne
# from mne.time_frequency import psd_welch


# # --- Settings ---
# preprocessed_file = r"C:\Users\97150\OneDrive\Desktop\DLP Module\src\eeg_windows_v1.npy"
# pdf_file = r"C:\Users\97150\OneDrive\Desktop\DLP_Module_EEG_Report_Preprocessed.pdf"
# n_windows_to_plot = 5  # number of windows to show as raw-like
# sfreq = 250  # example sampling frequency, adjust to your dataset
# channel_names = [f"Ch{i+1}" for i in range(19)]  # adjust if you have real channel names
# ch_types = ["eeg"] * 19

# # --- Load preprocessed EEG ---
# eeg_data = np.load(preprocessed_file, allow_pickle=True)
# if isinstance(eeg_data, np.ndarray) and eeg_data.ndim == 3:
#     print("Data shape (windows, channels, time points):", eeg_data.shape)
# else:
#     raise ValueError("Unexpected data shape. Should be (windows, channels, time points)")

# # --- Create PDF ---
# pdf = PdfPages(pdf_file)

# # --- 1. Raw-like plots for a few windows ---
# for i in range(min(n_windows_to_plot, eeg_data.shape[0])):
#     window = eeg_data[i]  # shape: (channels, time_points)
#     info = mne.create_info(ch_names=channel_names, sfreq=sfreq, ch_types=ch_types)
#     raw_window = mne.io.RawArray(window, info)
#     # raw_window.set_montage('standard_1020')
    
#     fig = raw_window.plot(show=False, title=f"Window {i+1} - Raw-like EEG", scalings='auto')
#     pdf.savefig(fig)
#     plt.close(fig)

# # --- 2. Average PSD across all windows ---
# # Concatenate windows along time for PSD estimation
# all_data = eeg_data.transpose(1, 0, 2).reshape(eeg_data.shape[1], -1)  # shape: channels x (windows*time)
# info = mne.create_info(ch_names=channel_names, sfreq=sfreq, ch_types=ch_types)
# raw_all = mne.io.RawArray(all_data, info)
# # raw_all.set_montage('standard_1020')

# fig_psd = raw_all.plot_psd(fmax=60, average=True, show=False)
# fig_psd.suptitle("Average PSD Across All Windows")
# pdf.savefig(fig_psd)
# plt.close(fig_psd)

# # --- 3. Alpha band topomap (8-12 Hz) ---
# psds, freqs = psd_welch(raw_all, fmin=8, fmax=12, n_fft=512)
# psd_mean = psds.mean(axis=1)  # mean across frequencies
# fig_topo, ax = plt.subplots()
# mne.viz.plot_topomap(psd_mean, raw_all.info, axes=ax, show=False)
# ax.set_title("Alpha Band (8-12 Hz) Topomap")
# pdf.savefig(fig_topo)
# plt.close(fig_topo)

# pdf.close()
# print(f"Preprocessed EEG report saved to: {pdf_file}")







import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import mne

# --- Settings ---
preprocessed_file = r"C:\Users\97150\OneDrive\Desktop\DLP Module\src\eeg_windows_v1.npy"
pdf_file = r"C:\Users\97150\OneDrive\Desktop\Preprossedreport.pdf"
n_windows_to_plot = 5  # number of windows to show as raw-like
sfreq = 250  # adjust to your dataset
channel_names = [f"Ch{i+1}" for i in range(19)]
ch_types = ["eeg"] * 19

# --- Load preprocessed EEG ---
eeg_data = np.load(preprocessed_file, allow_pickle=True)
if isinstance(eeg_data, np.ndarray) and eeg_data.ndim == 3:
    print("Data shape (windows, channels, time points):", eeg_data.shape)
else:
    raise ValueError("Unexpected data shape. Should be (windows, channels, time points)")

# --- Create PDF ---
pdf = PdfPages(pdf_file)

# --- 1. Raw-like plots for a few windows ---
for i in range(min(n_windows_to_plot, eeg_data.shape[0])):
    window = eeg_data[i]  # shape: (channels, time_points)
    info = mne.create_info(ch_names=channel_names, sfreq=sfreq, ch_types=ch_types)
    raw_window = mne.io.RawArray(window, info)
    
    fig = raw_window.plot(show=False, title=f"Window {i+1} - Raw-like EEG", scalings='auto')
    pdf.savefig(fig)
    plt.close(fig)

# --- 2. Average PSD across all windows ---
# Concatenate windows along time for PSD
all_data = eeg_data.transpose(1, 0, 2).reshape(eeg_data.shape[1], -1)  # channels x (windows*time)
info = mne.create_info(ch_names=channel_names, sfreq=sfreq, ch_types=ch_types)
raw_all = mne.io.RawArray(all_data, info)

psds = raw_all.compute_psd(fmin=1, fmax=60, n_fft=512).get_data()  # MNE v1.3+
psd_mean = psds.mean(axis=1)  # mean over frequencies

fig_psd, ax = plt.subplots()
ax.plot(raw_all.ch_names, psd_mean)
ax.set_title("Average PSD Across All Channels")
ax.set_xlabel("Channels")
ax.set_ylabel("Power (dB)")
plt.xticks(rotation=45)
pdf.savefig(fig_psd)
plt.close(fig_psd)

# --- 3. Alpha band power per channel (8-12 Hz) ---
psds_alpha = raw_all.compute_psd(fmin=8, fmax=12, n_fft=512).get_data()
alpha_mean = psds_alpha.mean(axis=1)  # mean over frequencies

fig_alpha, ax = plt.subplots()
ax.bar(raw_all.ch_names, alpha_mean)
ax.set_title("Alpha Band (8-12 Hz) Power per Channel")
ax.set_ylabel("Power (dB)")
plt.xticks(rotation=45)
pdf.savefig(fig_alpha)
plt.close(fig_alpha)

# --- Close PDF ---
pdf.close()
print(f"Preprocessed EEG report saved to: {pdf_file}")
