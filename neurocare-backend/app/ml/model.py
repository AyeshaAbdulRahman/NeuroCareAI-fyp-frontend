"""
Model architecture — TCN_LSTM for EEG dementia classification.
Copied from training script; DO NOT modify training script.
"""

import torch
import torch.nn as nn

N_FILTERS   = 32
KERNEL_SIZE = 7
DILATION    = 1
DROP_TCN    = 0.2
DROP_DENSE  = 0.2
LSTM_UNITS  = 64
DENSE_UNITS = [128, 192, 256]


class TCNBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, dilation, dropout):
        super().__init__()
        padding = "same"

        self.conv1    = nn.Conv1d(in_channels, out_channels, kernel_size,
                                  padding=padding, dilation=dilation)
        self.bn1      = nn.BatchNorm1d(out_channels)
        self.act1     = nn.ReLU()
        self.sdrop    = nn.Dropout1d(dropout)

        self.conv2    = nn.Conv1d(out_channels, out_channels, kernel_size,
                                  padding=padding, dilation=dilation)
        self.bn2      = nn.BatchNorm1d(out_channels)
        self.act2     = nn.ReLU()

        self.shortcut = nn.Conv1d(in_channels, out_channels, kernel_size=1)

    def forward(self, x):
        res = self.shortcut(x)
        out = self.sdrop(self.act1(self.bn1(self.conv1(x))))
        out = self.act2(self.bn2(self.conv2(out)))
        return out + res


class TCN_LSTM(nn.Module):
    def __init__(self, n_classes=2):
        super().__init__()

        self.tcn_block1 = TCNBlock(1, N_FILTERS, KERNEL_SIZE, DILATION, DROP_TCN)
        self.tcn_block2 = TCNBlock(N_FILTERS, N_FILTERS, KERNEL_SIZE, DILATION, DROP_TCN)

        self.lstm = nn.LSTM(input_size=N_FILTERS, hidden_size=LSTM_UNITS, batch_first=True)

        self.fc1   = nn.Linear(LSTM_UNITS,     DENSE_UNITS[0])
        self.drop1 = nn.Dropout(DROP_DENSE)
        self.fc2   = nn.Linear(DENSE_UNITS[0], DENSE_UNITS[1])
        self.drop2 = nn.Dropout(DROP_DENSE)
        self.fc3   = nn.Linear(DENSE_UNITS[1], DENSE_UNITS[2])
        self.drop3 = nn.Dropout(DROP_DENSE)
        self.out   = nn.Linear(DENSE_UNITS[2], n_classes)

    def forward(self, x):
        x = self.tcn_block1(x)
        x = self.tcn_block2(x)
        x = x.transpose(1, 2)
        lstm_out, _ = self.lstm(x)
        x = lstm_out[:, -1, :]
        x = self.drop1(torch.relu(self.fc1(x)))
        x = self.drop2(torch.relu(self.fc2(x)))
        x = self.drop3(torch.relu(self.fc3(x)))
        return self.out(x)