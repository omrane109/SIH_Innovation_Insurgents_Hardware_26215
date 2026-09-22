<div align="center">

# 🧠 Brain-Controlled Verbal Communication Enabled Wheelchair

**Hands-free mobility, safety and communication for people with severe motor and speech impairments**

[![Smart India Hackathon 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange)](https://sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-MedTech%20%7C%20HealthTech-green)](#)
[![Category](https://img.shields.io/badge/Category-Hardware-blue)](#)
[![Controller](https://img.shields.io/badge/Controller-ESP32-red)](#)
[![Status](https://img.shields.io/badge/Prototype-Working-brightgreen)](#)

**Team Innovation Insurgents** · Team ID `144769` · Problem Statement ID `26215`

</div>

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [The Need](#-the-need)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Online and Offline Operation](#-online-and-offline-operation)
- [Cost Comparison](#-cost-comparison)
- [Future Scope](#-future-scope)
- [References](#-references)
- [Disclaimer](#-disclaimer)

---

## 🎯 Problem Statement

| Field | Details |
|---|---|
| **Problem Statement ID** | 26215 |
| **Title** | Student Innovation — Cutting-edge technology in these sectors continues to be in demand. Recent shifts in healthcare trends and growing populations also present an array of opportunities for innovation. |
| **Theme** | MedTech / BioTech / HealthTech |
| **Category** | Hardware |
| **Team Name** | Innovation Insurgents |
| **Team ID** | 144769 |

---

## ❗ The Need

- **Caregiver dependence** — Conventional wheelchairs need physical control, which limits independent mobility for people with severe motor impairments.
- **Global gap** — According to the WHO, around **80 million** people may need a wheelchair, and **65%–95%** of them still lack access to one.
- **Where the gap is largest** — Most unmet demand is in low- and middle-income countries.
- **Missing features** — Existing solutions often lack hands-free control, obstacle detection, GPS, battery monitoring, emergency communication and offline reliability.

---

## 💡 Our Solution

A **low-cost, modular smart wheelchair** that the user drives with **intentional eye blinks and EEG signals** captured by a MindWave headset. An SVM model classifies the signals into movement commands, and an ESP32 drives the motors while continuously running safety checks.

On top of mobility, the wheelchair gives the user a **voice** through Text-to-Speech, and keeps caregivers informed with **live GPS tracking, a web dashboard and emergency alerts** that keep working even without internet.

> **Safer · Independent · Reliable · Accessible**

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **Brain + Blink Control** | EEG and eye-blink based navigation: Forward, Left, Right and Stop |
| 🛡️ **Smart Safety** | Ultrasonic obstacle detection, tilt/fall monitoring and a hardware emergency stop |
| 🔋 **Battery Monitoring** | INA226 tracks voltage, current and power, with low-battery alerts |
| 📍 **GPS & Caregiver Dashboard** | Live location, geofencing and real-time status monitoring |
| 📡 **Dual-Mode Emergency Alerts** | Wi-Fi + Twilio when online, SIM800L GSM SMS/calls when offline |
| 🗣️ **Verbal Communication** | Text-to-Speech with predefined and user-defined messages (multilingual) |
| ⚙️ **Customisable Blink Threshold** | Sensitivity can be tuned to each user |
| 🧩 **Modular Design** | Every module can be integrated, replaced or upgraded independently |

---

## 🌐 Online and Offline Operation

| Mode | Path |
|---|---|
| **Online** | Wi-Fi → IoT Dashboard → Twilio SMS/Call |
| **Network failure** | SIM800L → SMS/Call |

**Essential functions that work without internet:** navigation, obstacle detection, emergency stop and battery monitoring.

---

## 💰 Cost Comparison

| Wheelchair | Approximate Cost |
|---|---|
| Conventional motorised wheelchair | ₹74,000 – ₹1,00,000 |
| **Our smart wheelchair** | **₹40,000 – ₹50,000** |

Our wheelchair costs less while adding hands-free control, safety monitoring, GPS tracking and verbal communication.

---

## 🔭 Future Scope

- Improved ML models for higher classification accuracy
- Additional sensors and input interfaces
- Expanded health and status monitoring
- Deployment path: **individual user → caregiver monitoring → healthcare and assistive-care settings**

---

## 📚 References

1. BCI Arduino Wheelchair Controller — _Add link_
2. IoT Smart Wheelchair + EEG — _Add link_
3. Eye-Blink HCI using EEG Signals — _Add link_
4. Wheelchair Control using BCI — _Add link_
5. Brain-Wave Car Control with Arduino — _Add link_
6. WHO–UNICEF Global Report on Assistive Technology — _Add link_
7. WHO Wheelchair Provision Guidelines — _Add link_

---

## ⚠️ Disclaimer

This project is a **student research prototype** built for Smart India Hackathon 2026. It is not a certified medical device and has not undergone clinical validation. It should only be tested under supervision, with the hardware emergency stop within reach.

---

<div align="center">

Made with ❤️ by **Team Innovation Insurgents**

</div>
