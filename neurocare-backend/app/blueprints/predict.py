# # """
# # app/blueprints/predict.py
# # Replicates the EXACT pipeline from the training script:
# #   filter_classes → prepare_data (split+scale) → inference → classification_report
# # Accepts: X.npy + y.npy uploads
# # Returns: full classification report metrics
# # """

# # import io
# # import numpy as np
# # from flask import Blueprint, request, jsonify, current_app
# # from sklearn.model_selection import GroupShuffleSplit
# # from sklearn.preprocessing import MinMaxScaler
# # from sklearn.metrics import classification_report, confusion_matrix

# # predict_bp = Blueprint("predict", __name__, url_prefix="/api")

# # # ── lazy model singleton ──────────────────────────────────────────────────────
# # _model = None

# # def _get_model():
# #     global _model
# #     if _model is None:
# #         import torch
# #         from app.ml.model import TCN_LSTM
# #         device     = current_app.config.get("ML_DEVICE", "cpu")
# #         model_path = current_app.config.get("MODEL_PATH", "best_task2.pth")
# #         m = TCN_LSTM(n_classes=2).to(device)
# #         m.load_state_dict(torch.load(model_path, map_location=device))
# #         m.eval()
# #         _model = m
# #     return _model


# # # ── exact replica of training script helpers ─────────────────────────────────

# # def _make_splits(X, y, groups, random_state=42):
# #     gss_outer = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=random_state)
# #     train_idx, temp_idx = next(gss_outer.split(X, y, groups))

# #     gss_inner = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
# #     val_idx_rel, test_idx_rel = next(
# #         gss_inner.split(X[temp_idx], y[temp_idx], groups[temp_idx])
# #     )
# #     val_idx  = temp_idx[val_idx_rel]
# #     test_idx = temp_idx[test_idx_rel]
# #     return train_idx, val_idx, test_idx


# # def _filter_classes(X, y, keep_labels, remap):
# #     mask  = np.isin(y, keep_labels)
# #     X_f   = X[mask]
# #     y_f   = np.array([remap[lbl] for lbl in y[mask]], dtype=np.int64)
# #     return X_f, y_f, mask


# # def _run_pipeline(X_raw, y_raw):
# #     """
# #     Mirrors training script Task 2 exactly:
# #       1. filter_classes  (AD→0, FTD→0, CN→1)
# #       2. make_splits     (80/10/10, random_state=42)
# #       3. MinMaxScaler    (fit on train only)
# #       4. inference on test split
# #       5. classification_report
# #     """
# #     import torch
# #     import torch.nn.functional as F

# #     device = current_app.config.get("ML_DEVICE", "cpu")
# #     model  = _get_model()

# #     # groups: use sample index as group (no subject info in uploaded data)
# #     # This means split is random per-sample, not per-subject
# #     # (same behaviour as if user uploads only test features)
# #     groups = np.arange(len(X_raw))

# #     # Step 1 — filter & remap
# #     remap = {0: 0, 2: 0, 1: 1}
# #     X2, y2, _ = _filter_classes(X_raw, y_raw, keep_labels=[0, 1, 2], remap=remap)
# #     groups2   = np.arange(len(X2))

# #     # Step 2 — split
# #     train_idx, val_idx, test_idx = _make_splits(X2, y2, groups2)

# #     X_te = X2[test_idx]
# #     y_te = y2[test_idx]

# #     # Step 3 — scale (fit on train only, apply to test)
# #     scaler = MinMaxScaler()
# #     scaler.fit(X2[train_idx])
# #     X_te_scaled = scaler.transform(X_te)

# #     # Step 4 — reshape & inference
# #     X_tensor = torch.tensor(
# #         X_te_scaled[:, np.newaxis, :], dtype=torch.float32
# #     ).to(device)

# #     with torch.no_grad():
# #         logits = model(X_tensor)
# #         probs  = F.softmax(logits, dim=1).cpu().numpy()

# #     y_pred = np.argmax(probs, axis=1)

# #     # Step 5 — classification report
# #     target_names = ["AD+FTD", "CN"]
# #     report_dict  = classification_report(
# #         y_te, y_pred, target_names=target_names, output_dict=True, zero_division=0
# #     )
# #     cm = confusion_matrix(y_te, y_pred).tolist()

# #     # Build per-class rows matching the console output style
# #     rows = []
# #     for cls in target_names:
# #         rows.append({
# #             "class":     cls,
# #             "precision": round(report_dict[cls]["precision"], 4),
# #             "recall":    round(report_dict[cls]["recall"],    4),
# #             "f1":        round(report_dict[cls]["f1-score"],  4),
# #             "support":   int(report_dict[cls]["support"]),
# #         })

# #     return {
# #         "class_report": rows,
# #         "accuracy":     round(report_dict["accuracy"], 4),
# #         "macro_avg": {
# #             "precision": round(report_dict["macro avg"]["precision"], 4),
# #             "recall":    round(report_dict["macro avg"]["recall"],    4),
# #             "f1":        round(report_dict["macro avg"]["f1-score"],  4),
# #         },
# #         "weighted_avg": {
# #             "precision": round(report_dict["weighted avg"]["precision"], 4),
# #             "recall":    round(report_dict["weighted avg"]["recall"],    4),
# #             "f1":        round(report_dict["weighted avg"]["f1-score"],  4),
# #         },
# #         "confusion_matrix": cm,
# #         "target_names":     target_names,
# #         "n_test_samples":   len(y_te),
# #     }


# # # ── endpoint ──────────────────────────────────────────────────────────────────
# # @predict_bp.route("/predict", methods=["POST"])
# # def predict():
# #     """
# #     Expects multipart upload:
# #       - file_X : .npy  (shape N,6)  — features
# #       - file_y : .npy  (shape N,)   — true labels (0=AD, 1=CN, 2=FTD)
# #     """
# #     if "file_X" not in request.files or "file_y" not in request.files:
# #         return jsonify({"error": "Upload both file_X (.npy) and file_y (.npy)"}), 400

# #     try:
# #         X_raw = np.load(io.BytesIO(request.files["file_X"].read()))
# #         y_raw = np.load(io.BytesIO(request.files["file_y"].read()))
# #     except Exception as e:
# #         return jsonify({"error": f"Failed to load files: {e}"}), 400

# #     if X_raw.ndim != 2 or X_raw.shape[1] != 6:
# #         return jsonify({"error": f"X must be shape (N,6), got {X_raw.shape}"}), 400
# #     if y_raw.ndim != 1 or len(y_raw) != len(X_raw):
# #         return jsonify({"error": "y must be shape (N,) matching X rows"}), 400

# #     try:
# #         result = _run_pipeline(X_raw, y_raw)
# #     except Exception as e:
# #         current_app.logger.error(f"Pipeline error: {e}")
# #         return jsonify({"error": str(e)}), 500

# #     return jsonify(result)


# """
# app/blueprints/predict.py
# Replicates the EXACT pipeline from the training script:
#   filter_classes → prepare_data (split+scale) → inference → classification_report
# Accepts: X.npy + y.npy + groups.npy uploads
# Returns: full classification report metrics
# """

# import io
# import numpy as np
# from flask import Blueprint, request, jsonify, current_app
# from sklearn.model_selection import GroupShuffleSplit
# from sklearn.preprocessing import MinMaxScaler
# from sklearn.metrics import classification_report, confusion_matrix

# predict_bp = Blueprint("predict", __name__, url_prefix="/api")

# # ── lazy model singleton ──────────────────────────────────────────────────────
# _model = None

# def _get_model():
#     global _model
#     if _model is None:
#         import torch
#         from app.ml.model import TCN_LSTM
#         device     = current_app.config.get("ML_DEVICE", "cpu")
#         model_path = current_app.config.get("MODEL_PATH", "best_task2.pth")
#         m = TCN_LSTM(n_classes=2).to(device)
#         m.load_state_dict(torch.load(model_path, map_location=device))
#         m.eval()
#         _model = m
#     return _model


# # ── exact replica of training script helpers ─────────────────────────────────

# def _make_splits(X, y, groups, random_state=42):
#     """Identical to make_splits() in the training script."""
#     gss_outer = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=random_state)
#     train_idx, temp_idx = next(gss_outer.split(X, y, groups))

#     gss_inner = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
#     val_idx_rel, test_idx_rel = next(
#         gss_inner.split(X[temp_idx], y[temp_idx], groups[temp_idx])
#     )
#     val_idx  = temp_idx[val_idx_rel]
#     test_idx = temp_idx[test_idx_rel]
#     return train_idx, val_idx, test_idx


# def _filter_classes(X, y, groups, keep_labels, remap):
#     """Identical to filter_classes() in the training script — preserves groups."""
#     mask  = np.isin(y, keep_labels)
#     X_f   = X[mask]
#     y_f   = np.array([remap[lbl] for lbl in y[mask]], dtype=np.int64)
#     grp_f = groups[mask]
#     return X_f, y_f, grp_f


# def _run_pipeline(X_raw, y_raw, groups_raw):
#     """
#     Mirrors training script Task 2 exactly:
#       1. filter_classes  (AD→0, FTD→0, CN→1)  — keeps real subject groups
#       2. make_splits     (80/10/10, random_state=42) — group-aware, no leakage
#       3. MinMaxScaler    (fit on train only)
#       4. inference on test split
#       5. classification_report
#     """
#     import torch
#     import torch.nn.functional as F

#     device = current_app.config.get("ML_DEVICE", "cpu")
#     model  = _get_model()

#     # Step 1 — filter & remap (pass real groups through)
#     remap = {0: 0, 2: 0, 1: 1}
#     X2, y2, grp2 = _filter_classes(
#         X_raw, y_raw, groups_raw,
#         keep_labels=[0, 1, 2], remap=remap
#     )

#     # Step 2 — group-aware split (identical to training script)
#     train_idx, val_idx, test_idx = _make_splits(X2, y2, grp2)

#     X_te = X2[test_idx]
#     y_te = y2[test_idx]

#     # Step 3 — scale (fit on train only, apply to test)
#     scaler = MinMaxScaler()
#     scaler.fit(X2[train_idx])
#     X_te_scaled = scaler.transform(X_te)

#     # Step 4 — reshape & inference
#     X_tensor = torch.tensor(
#         X_te_scaled[:, np.newaxis, :], dtype=torch.float32
#     ).to(device)

#     with torch.no_grad():
#         logits = model(X_tensor)
#         probs  = F.softmax(logits, dim=1).cpu().numpy()

#     y_pred = np.argmax(probs, axis=1)

#     # Step 5 — classification report
#     target_names = ["AD+FTD", "CN"]
#     report_dict  = classification_report(
#         y_te, y_pred, target_names=target_names, output_dict=True, zero_division=0
#     )
#     cm = confusion_matrix(y_te, y_pred).tolist()

#     rows = []
#     for cls in target_names:
#         rows.append({
#             "class":     cls,
#             "precision": round(report_dict[cls]["precision"], 4),
#             "recall":    round(report_dict[cls]["recall"],    4),
#             "f1":        round(report_dict[cls]["f1-score"],  4),
#             "support":   int(report_dict[cls]["support"]),
#         })

#     return {
#         "class_report": rows,
#         "accuracy":     round(report_dict["accuracy"], 4),
#         "macro_avg": {
#             "precision": round(report_dict["macro avg"]["precision"], 4),
#             "recall":    round(report_dict["macro avg"]["recall"],    4),
#             "f1":        round(report_dict["macro avg"]["f1-score"],  4),
#         },
#         "weighted_avg": {
#             "precision": round(report_dict["weighted avg"]["precision"], 4),
#             "recall":    round(report_dict["weighted avg"]["recall"],    4),
#             "f1":        round(report_dict["weighted avg"]["f1-score"],  4),
#         },
#         "confusion_matrix": cm,
#         "target_names":     target_names,
#         "n_test_samples":   len(y_te),
#     }


# # ── endpoint ──────────────────────────────────────────────────────────────────
# @predict_bp.route("/predict", methods=["POST"])
# def predict():
#     """
#     Expects multipart upload:
#       - file_X      : .npy  (shape N,6)  — features
#       - file_y      : .npy  (shape N,)   — true labels (0=AD, 1=CN, 2=FTD)
#       - file_groups : .npy  (shape N,)   — subject IDs (groups_deeplearning.npy)
#     """
#     missing = [f for f in ("file_X", "file_y", "file_groups") if f not in request.files]
#     if missing:
#         return jsonify({"error": f"Missing file(s): {', '.join(missing)}. Upload file_X, file_y, and file_groups."}), 400

#     try:
#         X_raw      = np.load(io.BytesIO(request.files["file_X"].read()))
#         y_raw      = np.load(io.BytesIO(request.files["file_y"].read()))
#         groups_raw = np.load(io.BytesIO(request.files["file_groups"].read()), allow_pickle=True)
#     except Exception as e:
#         return jsonify({"error": f"Failed to load files: {e}"}), 400

#     if X_raw.ndim != 2 or X_raw.shape[1] != 6:
#         return jsonify({"error": f"X must be shape (N,6), got {X_raw.shape}"}), 400
#     if y_raw.ndim != 1 or len(y_raw) != len(X_raw):
#         return jsonify({"error": "y must be shape (N,) matching X rows"}), 400
#     if groups_raw.ndim != 1 or len(groups_raw) != len(X_raw):
#         return jsonify({"error": "groups must be shape (N,) matching X rows"}), 400

#     try:
#         result = _run_pipeline(X_raw, y_raw, groups_raw)
#     except Exception as e:
#         current_app.logger.error(f"Pipeline error: {e}")
#         return jsonify({"error": str(e)}), 500

#     return jsonify(result)








"""
app/blueprints/predict.py
Two endpoints on the same blueprint:

  POST /api/predict          — batch inference (X.npy + y.npy + groups.npy)
  POST /api/predict/single   — single-patient inference (raw .set EEG file)

Both return JSON that DiagnosisResult.js already knows how to render.
The mode key ("batch" | "single") lets the frontend pick the right layout.
"""

import io
import os
import tempfile
import numpy as np
from flask import Blueprint, request, jsonify, current_app
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report, confusion_matrix
from app.models import db, UserActivity
from app.utils.jwt_utils import get_current_user_id

predict_bp = Blueprint("predict", __name__, url_prefix="/api")


# ── lazy model singleton (Task 2 — batch) ────────────────────────────────────
_model_batch = None

def _get_batch_model():
    global _model_batch
    if _model_batch is None:
        import torch
        from app.ml.model import TCN_LSTM
        device     = current_app.config.get("ML_DEVICE", "cpu")
        model_path = current_app.config.get("MODEL_PATH", "best_task2.pth")
        m = TCN_LSTM(n_classes=2).to(device)
        m.load_state_dict(torch.load(model_path, map_location=device))
        m.eval()
        _model_batch = m
    return _model_batch


# ── helpers shared with batch pipeline ───────────────────────────────────────
def _make_splits(X, y, groups, random_state=42):
    gss_outer = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=random_state)
    train_idx, temp_idx = next(gss_outer.split(X, y, groups))
    gss_inner = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=random_state)
    val_rel, test_rel = next(
        gss_inner.split(X[temp_idx], y[temp_idx], groups[temp_idx])
    )
    return train_idx, temp_idx[val_rel], temp_idx[test_rel]


def _filter_classes(X, y, groups, keep_labels, remap):
    mask  = np.isin(y, keep_labels)
    X_f   = X[mask]
    y_f   = np.array([remap[lbl] for lbl in y[mask]], dtype=np.int64)
    grp_f = groups[mask]
    return X_f, y_f, grp_f


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 1 — batch inference
# POST /api/predict
# Body: multipart — file_X, file_y, file_groups  (.npy)
# ═════════════════════════════════════════════════════════════════════════════
def _run_batch_pipeline(X_raw, y_raw, groups_raw):
    import torch
    import torch.nn.functional as F

    device = current_app.config.get("ML_DEVICE", "cpu")
    model  = _get_batch_model()

    remap = {0: 0, 2: 0, 1: 1}
    X2, y2, grp2 = _filter_classes(X_raw, y_raw, groups_raw,
                                    keep_labels=[0, 1, 2], remap=remap)
    train_idx, _, test_idx = _make_splits(X2, y2, grp2)

    scaler = MinMaxScaler()
    scaler.fit(X2[train_idx])
    X_te_scaled = scaler.transform(X2[test_idx])
    y_te        = y2[test_idx]

    X_t = torch.tensor(X_te_scaled[:, np.newaxis, :], dtype=torch.float32).to(device)
    with torch.no_grad():
        probs = torch.softmax(model(X_t), dim=1).cpu().numpy()
    y_pred = np.argmax(probs, axis=1)

    target_names = ["AD+FTD", "CN"]
    rep = classification_report(y_te, y_pred, target_names=target_names,
                                 output_dict=True, zero_division=0)
    cm  = confusion_matrix(y_te, y_pred).tolist()

    rows = [
        {
            "class":     cls,
            "precision": round(rep[cls]["precision"], 4),
            "recall":    round(rep[cls]["recall"],    4),
            "f1":        round(rep[cls]["f1-score"],  4),
            "support":   int(rep[cls]["support"]),
        }
        for cls in target_names
    ]
    return {
        "mode":         "batch",
        "class_report": rows,
        "accuracy":     round(rep["accuracy"], 4),
        "macro_avg":    {k: round(rep["macro avg"][v],    4)
                         for k, v in [("precision","precision"),
                                       ("recall","recall"), ("f1","f1-score")]},
        "weighted_avg": {k: round(rep["weighted avg"][v], 4)
                         for k, v in [("precision","precision"),
                                       ("recall","recall"), ("f1","f1-score")]},
        "confusion_matrix": cm,
        "target_names":     target_names,
        "n_test_samples":   int(len(y_te)),
    }


@predict_bp.route("/predict", methods=["POST"])
def predict_batch():
    missing = [f for f in ("file_X", "file_y", "file_groups")
               if f not in request.files]
    if missing:
        return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400

    try:
        X_raw      = np.load(io.BytesIO(request.files["file_X"].read()))
        y_raw      = np.load(io.BytesIO(request.files["file_y"].read()))
        groups_raw = np.load(io.BytesIO(request.files["file_groups"].read()),
                             allow_pickle=True)
    except Exception as e:
        return jsonify({"error": f"Failed to load files: {e}"}), 400

    if X_raw.ndim != 2 or X_raw.shape[1] != 6:
        return jsonify({"error": f"X must be (N,6), got {X_raw.shape}"}), 400
    if y_raw.ndim != 1 or len(y_raw) != len(X_raw):
        return jsonify({"error": "y must be (N,) matching X rows"}), 400
    if groups_raw.ndim != 1 or len(groups_raw) != len(X_raw):
        return jsonify({"error": "groups must be (N,) matching X rows"}), 400

    try:
        result = _run_batch_pipeline(X_raw, y_raw, groups_raw)
    except Exception as e:
        current_app.logger.error(f"Batch pipeline error: {e}")
        return jsonify({"error": str(e)}), 500

    return jsonify(result)


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 2 — single-patient inference
# POST /api/predict/single
# Body: multipart — file_set  (.set EEG file)
# ═════════════════════════════════════════════════════════════════════════════
def _run_single_pipeline(set_path: str):
    """
    Full preprocessing + Task-2 inference for one EEG recording.
    Mirrors inference.py::run_inference() for task2 only.
    Returns the same dict shape that inference.py produces.
    """
    import torch
    import joblib
    from pathlib import Path

    # ── preprocessing (same as inference.py extract_rbp_features) ──────────
    import mne
    from mne.preprocessing import ICA
    from mne_icalabel import label_components

    SFREQ       = 500
    WINDOW_SIZE = SFREQ * 6       # 3000 samples
    STRIDE      = WINDOW_SIZE // 2
    BANDS = {
        "Delta": (0.5,  4.0), "Theta": (4.0,  8.0),
        "Alpha": (8.0, 16.0), "Zaeta": (16.0, 24.0),
        "Beta":  (24.0,30.0), "Gamma": (30.0, 45.0),
    }

    raw = mne.io.read_raw_eeglab(set_path, preload=True, verbose=False)
    raw.filter(l_freq=0.5, h_freq=45.0, method="iir",
               iir_params={"order": 4, "ftype": "butter"}, verbose=False)

    # ASR bypass
    data         = raw.get_data()
    chan_std     = np.std(data, axis=1, keepdims=True)
    outlier_mask = chan_std > (17 * np.median(chan_std))
    raw_c        = raw.copy()
    raw_c.info["bads"].extend(
        [raw.ch_names[i] for i in range(len(raw.ch_names)) if outlier_mask[i]]
    )
    raw_c.interpolate_bads(reset_bads=True)
    raw = raw_c

    # ICA
    ica = ICA(n_components=19, method="infomax",
              fit_params=dict(extended=True), random_state=42,
              max_iter="auto", verbose=False)
    ica.fit(raw, verbose=False)
    ic_labels   = label_components(raw, ica, method="iclabel")
    ica.exclude = [i for i, lbl in enumerate(ic_labels["labels"])
                   if lbl in ["eye", "muscle"]]
    ica.apply(raw, verbose=False)

    data    = raw.get_data()
    n_times = data.shape[1]
    windows, start = [], 0
    while start + WINDOW_SIZE <= n_times:
        windows.append(data[:, start:start + WINDOW_SIZE])
        start += STRIDE

    if not windows:
        raise ValueError("No valid 6-second windows found in recording.")

    windows = np.array(windows)
    psds, freqs = mne.time_frequency.psd_array_welch(
        windows, sfreq=SFREQ, fmin=0.5, fmax=45.0,
        n_per_seg=SFREQ, verbose=False
    )

    features = []
    for ep in range(len(windows)):
        tp = np.where(psds[ep].sum(axis=1) == 0, 1e-12, psds[ep].sum(axis=1))
        rbp = []
        for bname, (fl, fh) in BANDS.items():
            mask = (freqs >= fl) & (freqs <= fh if bname == "Gamma" else freqs < fh)
            rbp.append(np.mean(psds[ep][:, mask].sum(axis=1) / tp))
        features.append(rbp)

    features = np.array(features, dtype=np.float32)   # (N, 6)
    n_epochs = len(features)

    band_powers = {b: round(float(np.mean(features[:, i])), 6)
                   for i, b in enumerate(BANDS)}

    # ── Task-2 inference ────────────────────────────────────────────────────
    device      = current_app.config.get("ML_DEVICE", "cpu")
    scaler_path = current_app.config.get("SCALER_PATH", "scaler_task2.pkl")
    model_path  = current_app.config.get("MODEL_PATH",  "best_task2.pth")

    scaler = joblib.load(scaler_path)
    X_norm = scaler.transform(features)[:, np.newaxis, :]   # (N,1,6)

    from app.ml.model import TCN_LSTM
    model = TCN_LSTM(n_classes=2).to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    X_t = torch.tensor(X_norm, dtype=torch.float32).to(device)
    with torch.no_grad():
        probs = torch.softmax(model(X_t), dim=1).cpu().numpy()   # (N,2)

    preds       = np.argmax(probs, axis=1)
    class_names = ["AD+FTD", "CN"]
    dementia_cls = [0]

    vote_counts = {cn: int((preds == i).sum()) for i, cn in enumerate(class_names)}
    mean_probs  = probs.mean(axis=0)
    top_class   = int(np.argmax(mean_probs))
    top_label   = class_names[top_class]
    confidence  = float(mean_probs[top_class]) * 100
    dem_prob    = float(sum(mean_probs[i] for i in dementia_cls)) * 100
    is_dementia = top_class in dementia_cls

    # ── ensemble (single task → dem_votes = 0 or 1) ─────────────────────────
    avg_dem_prob = dem_prob
    if avg_dem_prob >= 75:   conf_tier = "HIGH"
    elif avg_dem_prob >= 50: conf_tier = "MODERATE"
    elif avg_dem_prob >= 30: conf_tier = "LOW"
    else:                    conf_tier = "VERY LOW"

    if avg_dem_prob >= 75 and is_dementia:
        interp = ("Strong consensus indicates likely neurodegenerative dementia "
                  "(AD/FTD pattern). Clinical evaluation strongly recommended.")
    elif avg_dem_prob >= 50 and is_dementia:
        interp = ("Moderate evidence of dementia-like EEG patterns detected. "
                  "Further clinical workup advised.")
    elif avg_dem_prob >= 30:
        interp = ("Borderline patterns — some classifiers suggest atypical EEG. "
                  "Follow-up monitoring recommended.")
    else:
        interp = ("EEG patterns are consistent with a healthy control profile. "
                  "No strong dementia markers detected.")

    return {
        "mode":        "single",
        "subject":     Path(set_path).stem,
        "n_epochs":    n_epochs,
        "band_powers": band_powers,
        "tasks": {
            "task2": {
                "task_name":       "Binary  ((AD+FTD) vs CN)",
                "predicted_label": top_label,
                "confidence":      round(confidence, 2),
                "dementia_prob":   round(dem_prob, 2),
                "is_dementia":     is_dementia,
                "epoch_votes":     vote_counts,
                "mean_probs":      {cn: round(float(p) * 100, 2)
                                    for cn, p in zip(class_names, mean_probs)},
                "n_epochs":        n_epochs,
            }
        },
        "ensemble": {
            "verdict":           "DEMENTIA DETECTED" if is_dementia else "HEALTHY",
            "dementia_votes":    1 if is_dementia else 0,
            "total_tasks":       1,
            "avg_dementia_prob": round(avg_dem_prob, 2),
            "confidence_tier":   conf_tier,
            "interpretation":    interp,
        },
    }


@predict_bp.route("/predict/single", methods=["POST"])
def predict_single():
    if "file_set" not in request.files:
        return jsonify({"error": "Upload a .set EEG file as file_set"}), 400

    f = request.files["file_set"]
    if not f.filename.endswith(".set"):
        return jsonify({"error": "File must be a .set EEGLAB file"}), 400

    # Write to a temp file — MNE needs a real path
    suffix = os.path.splitext(f.filename)[1]
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        f.save(tmp.name)
        tmp_path = tmp.name

    try:
        result = _run_single_pipeline(tmp_path)
        # user_id = get_current_user_id()

        # activity = UserActivity(
        #     user_id=user_id,
        #     activity_type="diagnosis_submission",
        #     description=f"Diagnosis submitted: {f.filename}"
        # )

        # db.session.add(activity)
        # db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Single-patient pipeline error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)   # clean up temp file

    return jsonify(result)