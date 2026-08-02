# 🌐 Desktop Controller using ESP32 + MQTT

A secure IoT-based desktop power controller that allows you to remotely trigger your **Desktop PC** and **UPS** power buttons from anywhere in the world using an **ESP32**, **HiveMQ Cloud MQTT**, and a **GitHub Pages** hosted web interface.

---

## 📸 Project Overview

This project converts an ESP32 into a cloud-connected controller.

Two SG90 servo motors are mechanically attached to the **Desktop Power Button** and **UPS Power Button**.

A responsive web interface allows users to remotely trigger either servo through MQTT over TLS.

---

## ✨ Features

- 🌍 Remote Control from Anywhere
- 🔒 Secure MQTT over TLS
- ☁️ HiveMQ Cloud MQTT Broker
- 📱 Responsive Web Interface
- ⚡ ESP32 Online / Offline Detection
- 🔄 MQTT Last Will & Testament (LWT)
- ✅ Command Acknowledgement (STARTED / DONE / FAILED)
- 🔐 Trigger Lock (Prevents Multiple Commands)
- ⏳ Timeout Detection
- 🎯 Dynamic Servo Angle Configuration
- ✔ Input Validation (0°–180°)
- 💾 Saved User Settings (Local Storage)
- 💡 LED Status Memory
- 📶 Automatic WiFi Reconnection
- 🔁 Automatic MQTT Reconnection

---

# Hardware

| Component | Quantity |
|-----------|---------:|
| ESP32 Dev Module | 1 |
| SG90 Servo Motor | 2 |
| USB Power Supply | 1 |
| Mechanical Button Press Mechanism | 2 |

---

# Software

- Arduino IDE
- ESP32 Board Package
- HiveMQ Cloud
- GitHub Pages
- HTML
- CSS
- JavaScript
- MQTT.js

---

# Arduino Libraries

Install these libraries from Library Manager.

```
WiFi
WiFiClientSecure
PubSubClient
ESP32Servo
ArduinoJson
```

---

# MQTT Topics

## Commands

| Topic | Description |
|--------|-------------|
| `home/ups` | Trigger UPS Servo |
| `home/cpu` | Trigger Desktop Servo |

---

## Status

| Topic | Description |
|--------|-------------|
| `desktop/status` | ESP32 ONLINE / OFFLINE |

---

## Result

| Topic | Description |
|--------|-------------|
| `desktop/ups/result` | STARTED / DONE / FAILED |
| `desktop/cpu/result` | STARTED / DONE / FAILED |

---

# Web Interface

The web interface allows users to

- Trigger UPS
- Trigger Desktop
- Configure Servo Start Angle
- Configure Servo Rotate Angle
- Save Angle Settings
- Display ESP32 Online Status
- Display MQTT Connection Status
- Prevent Multiple Commands
- Show Execution Progress

---

# Servo Workflow

```
Trigger Button

        │

        ▼

Publish MQTT

        │

        ▼

ESP32 Receives Command

        │

        ▼

STARTED

        │

        ▼

Servo Rotates

        │

        ▼

Returns to Start Position

        │

        ▼

DONE

        │

        ▼

Web UI Shows

✅ Completed
```

---

# Connection Workflow

```
Phone / Laptop

        │

        ▼

GitHub Pages

        │

        ▼

HiveMQ Cloud

        │

        ▼

ESP32

        │

        ▼

Servo Motor
```

---

# Security

- MQTT over TLS (SSL)
- HiveMQ Cloud Authentication
- Username & Password Protected Broker
- Last Will & Testament Support

---

# Project Structure

```
Desktop-Controller/
│
├── index.html
├── style.css
├── script.js
├── desktop_controller.ino
├── README.md
└── images/
```

---

# How to Run

## 1. Upload Arduino Code

Open

```
desktop_controller.ino
```

Upload it to the ESP32.

---

## 2. Configure WiFi

Update

```cpp
const char* ssid = "...";
const char* wifi_password = "...";
```

---

## 3. Configure MQTT

Replace with your own HiveMQ credentials if needed.

```cpp
mqtt_server
mqtt_username
mqtt_password
```

---

## 4. Host Website

Upload

```
index.html
style.css
script.js
```

to GitHub Pages.

---

## 5. Open Website

Open the GitHub Pages URL on any device.

Example

```
https://yourusername.github.io/Desktop-Controller/
```

---

# Screenshots

Add screenshots here.

```
images/homepage.png

images/online.png

images/executing.png

images/completed.png
```

---

# Future Improvements

- OTA Firmware Update
- Servo Position Feedback
- Mobile App
- User Login
- Event Logs
- Command History
- Multiple Device Support
- Relay Module Support
- Notification System

---

# Author

**Rabi**

Robotics Engineer

Specialized in

- Humanoid Robotics
- Reinforcement Learning
- Embedded Systems
- ROS2
- ESP32
- IoT

---

# License

MIT License

---

⭐ If you like this project, please give it a Star.
