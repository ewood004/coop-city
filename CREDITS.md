# Coup City — Credits

## Music
- **"Coup City" day theme** (`music/coup-city-day.mp3`, 108 BPM, G major, 71.1 s loop) and **night lullaby** (`music/coup-city-night.mp3`, 78 BPM, 73.8 s loop).
- **Seasonal themes** (build 13, picked in ⚙️ Settings → Music, or chosen by date on Auto):
  **"Spring Morning"** (`music/coup-city-spring.mp3`, 100 BPM, 76.8 s loop), **"Harvest Lane"** (`music/coup-city-fall.mp3`, 92 BPM, 83.478 s loop) and **"Pumpkin Parade"** (`music/coup-city-halloween.mp3`, 112 BPM, 68.571 s loop).
  Auto plays Pumpkin Parade Oct 20–31, Spring Morning Mar 20–Jun 20, Harvest Lane Sep 22–Dec 20, and the Coup City theme the rest of the year.
  All five farm tracks are original compositions written for Coup City (© Bill Woody), approved by Bill by ear. No existing melodies were used or adapted.
  The note-by-note source for the day theme and lullaby (Python composer, MIDI files, render and master scripts) is in `music/source/`. The seasonal themes were made with the same toolchain and sound font.
- **Beats** (build 13, only when picked in Settings → Music; Auto never chooses them): **"Iron Beak"** (`music/coup-city-ironbeak.mp3`, 90s boom-bap, 90 BPM) and **"Lowrider Roost"** (`music/coup-city-lowrider.mp3`, 90s G-funk, 92 BPM).
  Each plays an 8-bar intro once, then loops a 32-bar body (Iron Beak 21.333–106.667 s, Lowrider Roost 20.870–104.348 s).
  The melodies, chords, bass lines and drum patterns are original (© Bill Woody), and no existing record, beat, sample or melody is used or recreated. The drums, bass, whistle and vinyl effects are synthesized in code.
  **Chicken recordings by alys (pdsounds.org), public domain** (`PD-author|alys`, `PD-pdsounds.org`, via Wikimedia Commons): "Hen announcing she's lain an egg" (cluck slices and scratch fills), "Medium rooster crowing" (Iron Beak intro) and "Small rooster crowing" (Lowrider Roost intro).
  The piano, koto, shamisen, strings, Rhodes and clavinet are rendered from the GeneralUser GS sound font below.
- **Instrument samples:** GeneralUser GS v2.0.3 SoundFont by S. Christian Collins — https://schristiancollins.com/generaluser.php
  The license explicitly lets you use it to make and sell music, including in commercial projects.
  The author notes that the origin of some samples is uncertain, though there have been no complaints since 2000.
  If that ever matters, the same MIDI can be re-rendered with FluidR3_GM (MIT).
- **Renderer:** spessasynth_core (Apache-2.0) — https://github.com/spessasus/spessasynth_core
- Mixed and mastered offline (numpy/scipy), then encoded as MP3 with 0.5 s of pre-roll and post-roll so the loop points are sample-accurate. Loop region: start at 0.5 s and run for the loop length.

## Sound effects
All sound effects are synthesized in the browser by `game.js`. No sample files are used.
