# Coup City — Credits

## Music
- **"Coup City" day theme** (`music/coup-city-day.mp3`, 108 BPM, G major, 71.1 s loop) and **night lullaby** (`music/coup-city-night.mp3`, 78 BPM, 73.8 s loop).
  Original compositions written for Coup City (© Bill Woody). No existing melodies were used or adapted.
  The note-by-note source (Python composer, MIDI files, render and master scripts) is in `music/source/`.
- **Instrument samples:** GeneralUser GS v2.0.3 SoundFont by S. Christian Collins — https://schristiancollins.com/generaluser.php
  The license explicitly lets you use it to make and sell music, including in commercial projects.
  The author notes that the origin of some samples is uncertain, though there have been no complaints since 2000.
  If that ever matters, the same MIDI can be re-rendered with FluidR3_GM (MIT).
- **Renderer:** spessasynth_core (Apache-2.0) — https://github.com/spessasus/spessasynth_core
- Mixed and mastered offline (numpy/scipy), then encoded as MP3 with 0.5 s of pre-roll and post-roll so the loop points are sample-accurate. Loop region: start at 0.5 s and run for the loop length.

## Sound effects
All sound effects are synthesized in the browser by `game.js`. No sample files are used.
