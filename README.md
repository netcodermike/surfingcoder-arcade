# SurfingCoder Arcade

[Open the arcade](https://surfingcoder.com/arcade/) to play **Barrel Patrol**, an original browser shooter inspired by classic formation shooters. Ride a pixel swell, shoot through waves of enemy formations, and dodge diving craft. Clearing a wave awards a bonus. Three hits end a game and your best score is stored on this device.

![Barrel Patrol in the SurfingCoder arcade](docs/arcade.webp)

Use Left and Right or A and D to steer. Hold Space to fire. P or Escape pauses. On touchscreens, use the buttons under the screen. Sound starts off and can be enabled in the marquee.

## Open a ROM

Select **Open ROM ZIP** and choose a ZIP compatible with [MAME 2003-Plus](https://docs.libretro.com/library/mame2003_plus/). A self-contained arcade set with its original filename is recommended. The page passes the selected file directly to the browser player. The emulator loads from the pinned [EmulatorJS CDN](https://cdn.emulatorjs.org/4.2.3/data/), and the ROM stays on your device. See [EmulatorJS source and license](https://github.com/EmulatorJS/EmulatorJS/tree/v4.2.3) and the [MAME 2003-Plus core](https://github.com/libretro/mame2003-plus-libretro).

[MAMEDev's official downloads](https://www.mamedev.org/roms/) include Alien Arena and other titles distributed for noncommercial use. Barrel Patrol runs as JavaScript and is built into the page.

## Run locally

Serve this directory with Python and open [localhost:8000](http://127.0.0.1:8000/).

```sh
python -m http.server 8000 --bind 127.0.0.1
node --test
```
