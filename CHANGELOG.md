06-12-2020
----------
Reticulum:
  - Fix issues with default room feature
  - Add dropbox support
  
Hubs:
  - Performance improvements in physics
  - Support for new Mediasoup-based SFU, dialog
  - Preferences dialog reorganized
  - Added gltF UV-scrolling
  - Lots of bug fixes

05-26-2020
----------

Hubs:
  - New NAF Janus adapter changes to support retries
  - New mobile UI for object list
  - Fix shrink command
  - Enabled desktop audio mixing through avatar

05-18-2020
----------

Hubs: 
- WebXR Support (!)
- Fix admin console styling and add sandbox warning
- Add UI to add accounts in admin console
- New npm workflows for development
- Optimized webrtc connection handling for increase lobby viewing
- Improved mobile object list styling
- Preferences for auto-exit, noice cancellation, disable sfx
- Fix crash in audio feedback component
- Fix noise cancellation in Chrome
- (Critical) Fix duck floatation behavior
- Add support for dash videos and x-mpegurl
- Fix menu z-fighting
- Fix networked scaling
- Fix skybox flicker when shrinking avatar
- Add "force_tcp" TURN override
- Fix avatar preview for minecraft avatars

04-22-2020
----------

Reticulum:
- Pre-TURN maintenence release
- Fix error when changing scenes due to ecto issue: https://github.com/elixir-ecto/ecto/issues/3246#issuecomment-616080541
https://github.com/mozilla/reticulum/pull/367

04-16-2020
----------

Reticulum:
- Prevent database pausing when users are connected
- Added `user_data` column to rooms
- Removed various bottlenecks to increase message throughput in load testing
- Properly deal with offline twitch streams
- Added rate limiting + better caching to video/3d model resolution
- Added CRUD API to update room information
- Fix issue with CORS proxying not dealing with HEAD requests properly
- Database is now properly migrated before server starts
- Added server TURN secret management

Hubs:
- Added better identity and account management in admin console
- Added account disabling to deny access
- Fix pagination in admin console
- Added emoji permissions, flying permissions
- Added owner configurable room cap
- Bugfixes to hubs cloud deploy tooling
- Allow locomotion from lobby view if enabled
- Enable echo cancellation in Chrome
- Add /audiomode experimental option to disable positional audio
- Fix fade in/out transition borders
- Move WASM physics into a worker
- Add morph target animation support
- Add basis texture support
- Add MOZ_lightmap support
- Add video stream refresh
- Add positional audio, speed modifier preferences
- Fix bug causing rooms to load slowly if no VR headset plugged in
- Upgrade three.js to r111/aframe 1.0.3
- Accessibility improvements

Spoke:
- Enable controls on images
- Added performance information helper
- Lots of bugfixes and performance improvements
