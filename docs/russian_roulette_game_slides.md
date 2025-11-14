# Russian Roulette Shot Game — Slide Deck (Markdown Version)

## Slide 1 — Title

# **Russian Roulette Shot Game App**
### Game Scenario + Screens + Wireframes
*Slide-style Specification Document*

---

## Slide 2 — Overview

## **What This App Is**
A party-oriented social drinking game app featuring:

- Russian roulette shot gameplay
- Real-time multiplayer
- Detailed game logs and history
- Friends system
- Team system
- Future drinking event scheduling
- Safety alerts & non-alcohol mode

---

## Slide 3 — Core Experience Loop

1. Host creates a room
2. Friends join via invite link / QR
3. Game proceeds in multiple rounds
4. Each round → pull trigger → hit or safe
5. Results shown after the match
6. Share or rematch

---

## Slide 4 — Full Game Scenarios

The app includes the following six scenarios:

- **S1:** Host starts Quick Game
- **S2:** Start game from scheduled event
- **S3:** Friends joining via link / QR
- **S4:** Multi-round gameplay
- **S5:** End-of-game actions
- **S6:** Safety features (overdrinking alert / non-alcohol mode)

---

## Slide 5 — S1: Starting a Quick Game (Host)

### Steps

1. Open Home screen
2. Tap **Quick Game Start**
3. Configure:
   - Game name
   - Max players
   - Shot count
   - Number of bullets (hits)
   - Penalty content (shot, water, dare)
   - Rounds (unlimited / fixed)
   - Privacy (public / private)
4. Tap "Create Room"
5. Room created → Host enters Lobby
6. Invite players via QR or link

---

## Slide 6 — S2: Starting Game from Event

1. Open **Events**
2. Select today’s drinking event
3. Tap **Start Game for This Event**
4. Loads preset rules
5. Generates room
6. Proceeds to Lobby

---

## Slide 7 — S3: Friends Join the Game

### Join via Link
1. Tap link
2. App opens
3. Confirm room info
4. Select nickname / icon
5. Join Lobby

### Join via QR
1. Scan QR
2. Follow same flow

---

## Slide 8 — S4: Multi-Round Gameplay

### 1. Lobby → Game Start
- All players tap **Ready**
- Host taps **Start Game**

### 2. Round Start
- Round number increases
- Turn order determined

### 3. Player Turn
- Active player sees **Pull Trigger**
- Server determines HIT / SAFE
- All devices show result

### 4. Round End
- If hit → round ends
- Host chooses: Next Round / End Game

---

## Slide 9 — S5: After the Game

After match:

- View rankings
- Titles assigned
- Logs saved
- Share result image
- Post to team page
- Rematch available

---

## Slide 10 — S6: Safety Feature Scenarios

### Overdrinking Alert
Triggered when:
- Too many hits
- User reports high drink count

### Non-Alcohol Mode
- Replaces shot penalties with water / soft drink / jokes
- Host can toggle any time

---

## Slide 11 — Screen List

| Screen | Purpose |
|--------|---------|
| Home | Start games / events / view history |
| Game Settings | Configure game rules |
| Lobby | Wait for members / invite / ready check |
| Game Round | Main gameplay |
| Result Screen | Rankings / share / rematch |
| History List | Past games overview |
| History Detail | Per-round logs |

---

## Slide 12 — Home Screen (Wireframe)

```
[ Home Screen ]

------------------------------
   App Name / Logo
------------------------------

[ Start Quick Game ]

-- Today's Events --
• Zemi Drinking Night 21:00
• Circle Party 22:00

-- Recent Games --
• Yesterday 23:12 — "Tank Festival"
• Two days ago — "Lab Party"

[ View Records ]
[ Friends / Teams ]
```

---

## Slide 13 — Game Settings (Wireframe)

```
[ Game Settings ]

Game Name: [ Friday Russian ]

Max Players: [ 6 ▼ ]

Shot Settings:
  [ 6 ] chambers, [ 1 ] bullet

Penalty (Hit):
 (●) 1 Shot
 ( ) 2 Shots
 ( ) Custom: [ Funny Impression 10 sec ]

Rounds:
 (●) Unlimited
 ( ) Max [ 10 ] rounds

Non-Alcohol Mode: [ OFF ]

Privacy:
 (●) Private
 ( ) Public

[ Create Room ]
```

---

## Slide 14 — Lobby (Wireframe)

```
[ Lobby - Friday Russian ]

Room ID: ABC123

(QR CODE DISPLAYED HERE)
[ Copy Invite Link ]

--- Players ----------------------
Naoki   [Ready] (Host)
Taro    [Not Ready]
Yuko    [Ready]
Ken     [Ready]

Your Status:
[ Set Ready ]  /  [ Cancel Ready ]

------------------------------
(Host only)
[ Start Game ]
```

---

## Slide 15 — Game Round (Wireframe)

```
[ Playing - Friday Russian ]

Round 3

Order:
 → Naoki
    Taro
    Yuko
    Ken

------------------------------------
[ Naoki's Turn ]

(If you are Naoki)
   [ Pull Trigger ]

(Other players)
   “Naoki is pulling the trigger…”

------------------------------------
(Result display)
💥 BOOM!! 💥
Naoki HIT!

------------------------------------
History:
R1: HIT → Yuko
R2: HIT → Ken

[ Switch to Non-Alcohol Mode ]
```

---

## Slide 16 — Result Screen (Wireframe)

```
[ Game Results - Friday Russian ]

Play Time: 32 minutes
Rounds: 8

--- Ranking ------------------------
1. Naoki — HIT 4 — "Tank of the Day"
2. Ken   — HIT 2
3. Yuko  — HIT 1
4. Taro  — HIT 0 — "Untouchable Ghost"

Titles:
Naoki — "Human Shield"
Taro  — "Shield Master"

------------------------------------
[ Rematch with Same Players ]
[ Post to Team Timeline ]
[ Save Image / SNS Share ]
[ Back to Home ]
```

---

## Slide 17 — History List (Wireframe)

```
[ Game History ]

2025/11/10 23:12
  “Friday Russian”
  4 players / MVP: Naoki
  [ View Details ]

2025/11/03 21:00
  “Lab Party”
  5 players / MVP: Ken
  [ View Details ]
```

---

## Slide 18 — History Detail (Wireframe)

```
[ Game History Detail ]

Date: 2025/11/10  23:12–23:44
Members: Naoki, Taro, Yuko, Ken

--- Player Stats --------------------
Naoki — 4 hits / 7 rounds
Taro  — 0 hits / 7 rounds
Yuko  — 1 hit  / 6 rounds
Ken   — 2 hits / 6 rounds

--- Round Log -----------------------
R1: HIT → Yuko
R2: HIT → Ken
R3: HIT → Naoki
R4: HIT → Naoki
R5: HIT → Ken
R6: HIT → Naoki
R7: HIT → Naoki
R8: No hit (timeout)

[ Create Rematch Room ]
```

---

## Slide 19 — Summary

### ✔ Includes:
- Full game scenarios
- Player flows
- Multi-round logic
- Results & safety features
- Screen list
- Wireframes

### ✔ Ready for:
- MVP development plan
- Backend API design
- Database schema
- Figma mockups

---

## Slide 20 — Next Steps

Choose next direction:

1. MVP task breakdown
2. Backend API + DB schema
3. UI mockups (Figma-ready)
4. Additional game modes

---

# END
