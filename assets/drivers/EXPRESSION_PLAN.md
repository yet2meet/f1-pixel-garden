# Driver Expression Plan

Baseline expression set for each driver:

1. `neutral` - default home portrait, gallery portrait, base identity.
2. `tap` - shown for 1-2 seconds after tapping the driver.
3. `anticipate` - shown after feed starts, before food reaches the mouth.
4. `eat` - shown when the food reaches the driver.
5. `satisfied` - shown after a successful normal feed.
6. `celebrate` - reward-only state: lucky feed, level up, weekly win, achievement unlock.
7. `tired` - daily feeds used up, stock empty, or invalid feed attempt.
8. `depleted` - reserve state for future low-energy / neglected / failed streak systems.

First gameplay integration should use:

`neutral`, `tap`, `anticipate`, `eat`, `satisfied`, `tired`

Optional but worth keeping in the art set:

`celebrate`

Reserve for later:

`depleted`

All generated baseline portraits and expression sheets should stay in
`assets/drivers/proofs` until approved. Do not overwrite formal runtime sprite sheets
until the full set is reviewed.
