# 2020-09-08

## Hubs

Hubs mozillareality/hubs/1.0.0/20200908210500
https://github.com/mozilla/hubs/pull/2990

### Hub Invite Links

A room can now be set to &ldquo;Invite only&rdquo;, which then generates an invite link that allows room access. The invite link can be revoked, or the room can be put back into &ldquo;Private&rdquo; mode. If a user attempts to enter a room without an invite id, they are denied access and shown our typical black room entry denial screen.


### Waypoint Improvements

You can now use links to teleport between waypoints in the scene.

### Medium quality mode

The medium quality mode is targeted at improving performance and graphics quality on budget desktops/laptops and mobile devices.

### Improved Accessibility for main UI

ARIA roles and labels have been added to several buttons and elements in the room UI. Tested with NVDA screen reader.

### Basic non-English language support

There is now a user preference for setting language and instructions for how to submit translation files to be reviewed and added to the app.

## Spoke

Spoke mozillareality/spoke/1.0.0/20200803233608
https://github.com/mozilla/Spoke/pull/1022

### Scene Preview Camera Node

The Scene Preview Camera Node can be placed in your scene and will be used to position the camera when generating thumbnails or previewing the scene in Hubs.

## Reticulum

Reticulum mozillareality/reticulum/1.0.1/20200817225751
https://github.com/mozilla/reticulum/pull/411

### Hub Invites

Added Hub Invites, which allows us to restrict access to rooms when they are in the :invite entry<sub>mode</sub>

### Clearer error messages for streaming failures.

Sharing media from popular streaming sites often fails for reasons beyond our control. We&rsquo;ve added clearer messaging for when this happens.

07-21-2020
----------
Reticulum 1.0.1/20200715190503
- Do not show favorite rooms that have been closed
- Bug fixes

Spoke 1.0.0/20200707224342
- Fixes for models exported by the Blender exporter
- Add "alpha mode" setting for images
- Bug fixes

Hubs 1.0.0/20200722000012
- Fix avatar previews on iOS
- Remove delete buttons from admin panel
- Add preference for preferred camera
- Bug fixes

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
