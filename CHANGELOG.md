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
