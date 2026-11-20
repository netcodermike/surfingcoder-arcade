# SurfingCoder Arcade

[Open SurfingCoder Arcade](https://surfingcoder.com/arcade/) to play two original browser games.

## Surf Break

Surf Break is the default. Ride through a reef maze and collect every pearl. Super swells reverse the chase, golden pineapples give bonus points, and each cleared break unlocks a new maze. Use the arrow keys or WASD to steer, P or Escape to pause, and M to toggle sound. Swipe or use the on-screen direction buttons on touchscreens.

![Surf Break in the Arcade](docs/arcade.webp)

Wipeout recording by kirbydx, distributed under CC0. [Original recording](https://freesound.org/people/kirbydx/sounds/175409/)

## Barrel Patrol

[Play Barrel Patrol](https://surfingcoder.com/arcade/barrel-patrol/), an original formation shooter set on a sunset reef break. Ride the moving crests and throw surfboards at mantas, squid, clawed crabs, and sharks. Dodge diving creatures and stinging bubbles. Three wipeouts end the ride.

![Two surfers throwing boards in Barrel Patrol](docs/barrel-patrol.webp)

### Ride modes

| Mode | Controls |
| --- | --- |
| **Solo** | Arrow keys or A / D to steer, Space to throw. |
| **Tandem** | Same controls. One player steers two surfers and throws both boards together. |
| **Local co-op** | Surfer 1 uses A / D and F or Space. Surfer 2 uses the arrows and slash or numpad zero. Score and lives are shared. |

Press P or Escape to pause. On touchscreens, hold the buttons below the playfield. Choose a ride mode before starting. Sound is on by default and can be muted in the arcade toolbar. Each mode keeps its own best score on this device.

### Bonus sets

Every third set is a bonus round. Shell Run sends shells in arcing groups. Glass Barrel sends them in S-shaped paths. Throw a board to catch each shell for 150 points. Catch all 21 for 2,100 more. Bonus sets have no creatures or bubbles that can cost a life.

## Open a ROM

Select **Open ROM ZIP** and choose a ZIP compatible with [MAME 2003-Plus](https://docs.libretro.com/library/mame2003_plus/). A self-contained arcade set with its original filename is recommended. The page passes the selected file directly to the browser player. The emulator loads from the pinned [EmulatorJS CDN](https://cdn.emulatorjs.org/4.2.3/data/), and the ROM stays on your device. See [EmulatorJS source and license](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3) and the [MAME 2003-Plus core](https://github.com/libretro/mame2003-plus-libretro).

[MAMEDev's official downloads](https://www.mamedev.org/roms/) include Alien Arena and other titles distributed for noncommercial use. The ROM launcher is available from either game.

## Run locally

Serve this directory with Python and open [localhost:8000](http://127.0.0.1:8000/).

```sh
python -m http.server 8000 --bind 127.0.0.1
node --test
```
