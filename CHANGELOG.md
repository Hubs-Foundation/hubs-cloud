## 2023-03-02

youtube-dl-api-server: 


|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
|   | mozillareality/reticulum/1.0.1/20230109224638              |
|   | mozillareality/hubs/1.0.0/20230109221430                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
| * | mozillareality/youtube-dl-api-server/0.5/20230303041110    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2023-02-06

Hubs:

```

76acceeb9 "Fix to wrong constants paths in compile warning"  #5869 
e00a9097e "Fix to Camera contol on mobile with virtual joystick enabled"  #5868 #5859
fe6dc1803 "Update to Japenese language translation for hubs" #5858 
ff47da501 "Adds tools for networked object debugging" #5842 
8a8d7762e "Create object menu stub for bitec" #5840
8ef035896 "Exposes bitec's utility fuctionality for debugging" #5839 
d1d378d13 "Remove Spawn controller from documentation and code" #5838 
5950b4183 "Fix bug with teleporting on invisible nav mash" #5837 

```
Ret: 

```
24409423 "Fix for missing stats partitions" #657 
13a4c2fb "Fix bug for estimating disk use" #643 
```

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20230109224638              |
| * | mozillareality/hubs/1.0.0/20230109221430                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |


## 2023-1-05

\* = User submitted PR.

Hubs:

<https://github.com/mozilla/hubs/compare/hc.test.2022-11-02...hc.test.2022-12-09>

```
afaf79f4e "reset padding on side chat logs"  #5836
6e8f23974 "Fixes Security bug with bio tool" #5851
ce4807c46 "Adds support for new Tooltips. Implements of new style and new storybook stories for tips" #5805
f81f203b3 "Fixes issues with storybook" #5844
4c57ce2b2 "Fixes word spacing in spawned messages" #5836
9da62c798 "fixes issues with using slash command" #5831
43730ec3f "Makes it so we don't import app.ts into the avatar preview page" #5827
ad175eee4 "Updates Japanese file" * #5658
779a2cb16 "Remove scene deletion because the feature doesn't exist on the backend" #5828
608f52d85 "Revert Hardcode HMC as a hub origin"  #5824
1fc6826c3 "Enable both range request and LOD progressive loading" #5795
8d333721c "Re-enable eslint rules, reformat files with prettier" #5817
5ec5f987c "Improvement to some networking edge cases" #5813
f805a1bfd "Subscribe to messages on the Hubs Phoenix channel before joining to prevent missed messages" #5811
b9970caf5 "Convert networking system to typescript" #5802
cba6296f6 "Improvement to screen capture" - *  #5718
8117da934 "Removing 3D game functionality from scene page to prevent regression" #5797
eda23d28f "Fixed bug with loading Null or Undefined" #5798
868600e5c "Fixed regression found in #5793"
c30675025 "Workaround to ignore LOD SkinnedMesh" #5782 
0f14b0669 "Improve the progressive loading + LOD Feature" #5774 
4f531a674 "Prevents losing the URL hash while moving to a new hub" #5758 *
31b005f8d "Improve latency of near spark processing" #5457 * 
87ace2417 "Fixes from #4268" #5464 * 
5339fbfd2 "Remove avatar-rig for audio zone tracking if not entering scene yet" #5553 * 
ca43d8d57 "Add glTF MSFT_Lod extension" #5713
1af56c451 "Gives room owner support to disable/enable voice and chat" #5731 
ecadbbc62 "Adds support for post-processing effects" #5742
8da1bdaa5 "Add toast notification for record mode" #2 *
```

Reticlum:

<https://github.com/mozilla/reticulum/compare/hc.test.2022-10-07...hc.test.2022-12-09>

```
8e6549ba "fixed discord mute feature" #638 
54b96346 "Adds admin mute feature to backend" #629 
```

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20221207161159              |
| * | mozillareality/hubs/1.0.0/20230104164505                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2022-11-03

Hubs:

```
0a02497ee "Merge pull request #5747 from mozilla/feature/turkey-swaps_admin-menu.js+HC_mode"
a5a05783d "turkey-swaps/admin-menu.js+HC mode"
56b370446 "Merge pull request #5743 from mozilla/feature/biojobfixes"
8553b54d9 "Update hab-wrap-and-push.sh"
```

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
|   | mozillareality/reticulum/1.0.1/20220911232411              |
| * | mozillareality/hubs/1.0.0/20221021041854                  |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2022-10-5

Hub:
<https://github.com/mozilla/hubs/compare/hc.test.2022-08-08...hc.test.2022-09-07>

```
1508e10d5 "bug/banner-fonts"
550a27d0e "fix-pref-drowpdown-arrow"
60a04b9b2 "hc-sep22-hotfixes"
65594ff6b "button-names"
6989217b6 "remove-quilt"
af1c6d8c3 "loop-animation-start-offset"
6543d8ed5 "fix-locale-extraction"
340f14fb1 "fix-scene-js"
a02cadf53 "dialog-token-refresh"
13a80cfa9 "fix-bot-track"
82ccf973e "load-media"
6fee45203 "add-typescript"
```

Reticulum:
<https://github.com/mozilla/reticulum/compare/hc.test.2022-08-02...hc.test.2022-09-08>

```
fb204507 "get_dialog-pod fixes for turkeymode"
1d42d591 "Update janus_load_status.ex'
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220911232411              |
| * | mozillareality/hubs/1.0.0/20220915030526                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2022-09-05

Contributions from the community are marked with [square brackets].

Community Contriubtions:

leonardoazzi -  769f5ec4e  

Vinecntfretin - 1fd11a800

Hubs:

<https://github.com/mozilla/hubs/compare/hc.test.2022-07-06...hc.test.2022-08-08>

```
105fb16ac Fix regressions from webpack upgrade
84a19016b "Media audio can be very loud on room entry and scene changes"
cce5562ad "Revert FixDarkenedVideoTextureTarget"
5689032ef Revert "Merge pull request #5604 from mozilla/FixDarkenedVideoTextureTarget" null
c189ac9a5 "Fix darkened video-texture-target"
1fd11a800 [Fix French translation of enable-on-screen-joystick-right]
769f5ec4e [Brazilian Portuguese locale update]
7c7adb1f2 "Fix issue switching between scenes with many entities"
e0fa6022f "Fix pen on touchscreen devices"
ed12a5ad0 "New Entity Framework"
778e02c51 "Resize textures for iOS in low material quality mode."
49a29f42f "Hubstrky 446"
8aced413f "Fix darkened camera view"
3afe8a44c "Set a default theme to fix the rest button"
0adaf1d2f "Force AppLogo refresh when system theme changes"
6bf3af8f5 "Revert \"Remove tool bar UI background\""
d1d1464e4 "Signing modal issues"
1113bc11c "Remove tool bar UI background"
cfa9fbf0c "Use low quality audio panning mode for Android"
b87189a6f "Update privacy policy and terms URLs"
1deaf3aa9 "Band-aid for physics-system crash"
cd8e2a12d "Extract only required references at Sketchfab Zip worker"
f16518fdc "Upgrade to Node LTS (16) and Webpack 5"
```

Reticulum:

<https://github.com/mozilla/reticulum/compare/hc.test.2022-07-06...hc.test.2022-08-02>

```
589799ab touch readme
7edad9f7 Add media-src CSP
2e8b9e47 Create protected endpoint for getting max ccu in a timerange
8fd1413f Rewrite domains in assets
bc1c8796 Fix typo
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220802042649              |
| * | mozillareality/hubs/1.0.0/20220826022110                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2022-08-01

Contributions from the community are marked with [square brackets].

Hubs:

<https://github.com/mozilla/hubs/compare/hc.test.2022-06-07...hc.test.2022-07-06>

```
944fe084f Fix pen drawing color
2ecf2243b Fix darkened MeshBasicMaterial lightMap
9cda2d8b6 Upgrade Three.js to r141
771f6a277 Force ToolbarMicButton reference update in every render
08a8f93bb Improve useVolume refresh to avoid react re-renders
aa957ca2d Remove all event handler when component is removed
2b4c257d4 Enable the virtual joysticks by default on mobiles
6aa3ba836 Always visible and fixed position virtual joysticks
cafc270b6 Skip Physics in super-spawner in the scene preview
4d16b3729 Prevent fullscreen request in fullscreen mode
56fd019da Release texture image more properly
78b465023 Restore derivatives support and limit the uniform vectors number
6dcb99a67 Update audio-debug fragment shader waves blur level
563c04919 Add Safari compat for the audio debugger
fa9c92cbd Adjust Right joystick rotation speed.
3e6f2148f [wsxiaoys] Fix share screen toggle.
59e86e42d Introduce slider for max resolution preference
7fa61c4c2 Fix Enable VirtualJoystick preference.
74bd374c0 Clean up getRenderResolution()
1f587dde2 Fix AvatarPreview
b550e720b Update networked-aframe dependency" [aframe migration](https://github.com/mozilla/hubs/pull/5536)
d458aa3b9 Introduce Audio PanningQuality preference
```

Reticulum:
<https://github.com/mozilla/reticulum/compare/hc.test.2022-06-07...hc.test.2022-07-06>

```
No function change to Hubs Cloud. The only updates are preparation for future Mozilla-managed Hubs instances.
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220707033621              |
| * | mozillareality/hubs/1.0.0/20220707032752                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2022-07-05

Contributions from the community are marked with [square brackets].

Hubs:

<https://github.com/mozilla/hubs/compare/hc.test.2022-05-02...hc.test.2022-06-07>

```
d68d0fd9 Fix a media-image transparent bug
561858b1 Remove unused three-batch-manager
373ce401 Add screen orientation awareness to hubs client
c4a1716e Re-enable Positional audio on Safari
9e7db4eb Remove easyrtc dependancy from NAF
9fb409eb Update best practices doc
f1213d3e Move fog handling to environment system
a47d7520 Test home page with browser stack
7f31b705 Fix dark-mode logo. Adds an AppLogo component to unify logo usage
eb0b0bb9 Performance optimization in setMatrixWorld()
50f58bb0 Turn off unnecessary scene.autoUpdate in camera-tool.tock()
5c21765a Remove more aframe builtin systems/components/concepts
d71c545a Fix invalid material.side parameter set in troika-text
b2010737 Fix a Three.js bug that causing skipped matrix updates
47ac8878 Minor readme tweaks
b70272e6 [uhunkler] README.md - update the Quick Start instructions for the local install
239ff6ae Fix Hubs Cloud admin panel deploy by replacing ncp with fs-extra copy
a2ed75ad Refactor common webpack page pattern
e905c809 Minor refactor for local dev host. dotenv cleanup.
1d51cf91 Updated video-texture-source.tock() to skip unnecessary scene.autoUpdate()
b9479459 Improve client performance by cache the result of isSafari()
```

Reticulum:
<https://github.com/mozilla/reticulum/compare/hc.test.2022-05-02...hc.test.2022-06-07>

```
No function change to Hubs Cloud. The only updates are preparation for future Mozilla-managed Hubs instances.
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220608145411              |
| * | mozillareality/hubs/1.0.0/20220607220319                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## (hotfix) 2022-06-08

Reticulum:

<https://github.com/mozilla/reticulum/pull/601/files>

```
56ef119 Fix a bug affecting room invite links
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220608133028              |
|   | mozillareality/hubs/1.0.0/20220503171532                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

## 2022-06-06

Contributions from the community are marked with [square brackets].

Hubs:

<https://github.com/mozilla/hubs/compare/hc.test.2022-04-04...hc.test.2022-05-02>

```
2225cc645 Fix a bug causing VR tracking to fail.
4c129b75c Fix a bug affecting the nametag preference
0cffd5f0c Fix some bugs affecting new nametags
aba81a395 Optimize performance of sprite systems.
17bb1174c Remove the matrix-auto-update component to improve performance.
ad10df59f Update GLTFLoader of three.js to version r128
0e8e622df Add a SECURITY.md file to tell people how to report security vulnerabilities.
b090136e2 Simplify the behavior of real-time shadows
a99baac8a Refactor AFRAME startup and request animation frame loop
176c6c40f Simplify message displayed when Hubs is loaded in an unsupported browser
1e06b8a41 Fix an issue where spawned chat messages appeared at the incorrect location on iOS Safari
a3c5b1690 Resolve a warning that React sends to the dev console during scene entry.
bc8dc5735 Improve the emoji picker in the chat panel.
```

Reticulum:
<https://github.com/mozilla/reticulum/compare/hc.test.2022-04-04...hc.test.2022-05-02>

```
No function change to Hubs Cloud. The only updates are preparation for future Mozilla-managed Hubs instances.
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220503172004              |
| * | mozillareality/hubs/1.0.0/20220503171532                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
|   | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

2022-05-02
----------

Contributions from the community are marked with [square brackets].

Hubs:

```
- c48052028 [juunini] Add mirror components.
- 72b6d80fe Update nametags to a brand new look!
- 6d39ba09b Add a lint step to PR submissions and update contributor guide.
- d65a77639 Fix an issue which caused the freeze-menu to display incorrectly.
- 7be5fe4d8 Fix an issue which caused permissions not to apply correctly in some cases.
- 9a84c9a01 Fix an issue that prevented users from seeing their own avatar in VR.
- e2c341ef5 Fix issues related to hiding the avatar's head in first-person mode.
- 5c63c76bf Fix an issue where default audio devices were not selected in Firefox.
- 230553ad2 Fix a (surprising) issue that caused emoji images to be re-requested several times.
- cb45657d4 [mattrossman] Fix an issue where the microphone icon did not display volume.
- 9c2eb3f6d Fix an issue where the Share button generated React errors in the console.
- d6e92e441 Fix an issue where previewing an avatar generated React errors in the console.
- 7f1c76159 Fix an issue which broke in-room video recording in Chrome.
- 2f1f9026f Fix an issue which broke shadows for directional lights.
- 7ede70ad6 [Cupcaked and tzuhuanlin] Add traditional Chinese locale.
- fe250175a [markusTraber] Add German locale.
- 0b8158d82 [anonymous] Add missing translations for Korean locale.
- 955014be0 Simplify mic setup logic.
- 7f85b2545 [yakyouk] Centralize defaults for preferences.
- b2f4c5f9c Fix an issue where matrix flags were not updated from networked updates.
- 1938d7a5d [juunini] Fix typos in locale definitions.
```

Spoke:

```
- fe3203f4 [jameskane] Update Troika Text components, which replace three-bmfont-text.
- f9b4e1c5 [juunini] Add mirror component
```

Reticulum:

```
- 3287e5b6 Update a dependency to fix an issue where connections would drop when downloading large blob files over HTTP2
- 4392f939 Add authorized endpoint to query CCU
- 406da963 Add typing and hand-raising indicators to networked state
- 849cff27 Optimize public rooms query
```

Packages that will be updated in this release are marked with an asterisk in the chart below.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220405231612              |
| * | mozillareality/hubs/1.0.0/20220405230710                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
| * | mozillareality/spoke/1.0.0/20220405230707                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

2022-04-04
---------

Hubs:

- Improve cursor accessibility with adjustable size
- Optimized emoji menu images for faster loading
- [Matt Rossman] Restore the ability to focus chat with a keyboard shortcut
- [James Kane] Replace three-bmfont-text with troika-three-text
- Update french translations
- Update darkmode theme.json
- Add Draco support to GLTF loader
- Add new microphone setup modal
- Add avatar volume controls to the sidebar
- Add option for objects to opt out of frustrum culling
- Add debugLocalScene flag for fast local scene testing
- Add support for reflection probes
- Remove 6-digit entry codes due to security/privacy concerns.
- [gfodor] Fix audio bug due to event handler removals
- Fix display issues with scene pages
- Fix an issue with custom themes
- Fix an issue where environment maps renderered black on flat objects
- [LearnHub] Fix an issue related to trying to release gltf resources that had not been cached
- [juunini] Fix an issue in the custom client deploy script
- Fix an issue with video-texture-target rendering in Chrome
- Fix an issue with Cloudflare affecting custom clients
- [rawnsley] Fix an issue with an uncaught DOM security exception when accessing properties of window.opener

Spoke:

- Fix the What's New page
- [juunini] Fix `creating-custom-elements` example

Reticulum:

- Fix an issue with Discord integration
- Added support for troika-text
- Security - Use a stricter CSP when serving uploaded files
- Security - Forbid media requests to internal ip addresses
- Security - Prevent XSS in uploads on IE11 with a modified CSP header.

|   | Packages                                                   |
|---|------------------------------------------------------------|
|   | mozillareality/ita/0.0.1/20211117212826                    |
| * | mozillareality/reticulum/1.0.1/20220311205847              |
| * | mozillareality/hubs/1.0.0/20220316130648                   |
|   | mozillareality/pgbouncer/1.12.0/20191106234457             |
| * | mozillareality/spoke/1.0.0/20220311214102                  |
|   | mozillareality/certbot/1.0.0/20191224043510                |
|   | mozillareality/youtube-dl-api-server/0.4/20220217230007    |
|   | mozillareality/janus-gateway/2.0.1/20211220195030          |
|   | mozillareality/postgrest/5.2.0/20190130035107              |
|   | mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
|   | mozillareality/coturn/4.5.3.0/20200422002445               |

Packages that will be updated in this release are marked with an asterisk in the chart above.

2022-02-07
---------

Hubs Cloud Release Highlights

- [Hubs] Audio zones - <https://github.com/mozilla/hubs/pull/4399>
- [Hubs] Audio debugging view - <https://github.com/mozilla/hubs/pull/4249>
- [Hubs] Enable server API - <https://github.com/mozilla/hubs/pull/4753>
- Documentation: <https://github.com/mozilla/reticulum/blob/master/guides/api.md>
- Enable /tokens endpoint to enable API tokens for your HC instance API requests - <https://github.com/mozilla/hubs/pull/4425>
- [Hubs] Fast room switching - <https://github.com/mozilla/hubs/pull/4347>
- [Hubs] Upload both logos for light and dark themes - <https://github.com/mozilla/hubs/pull/4786>
- [Hubs] Fix bugs on touchscreens that made buttons unclickable and flung objects - <https://github.com/mozilla/hubs/pull/4740> / <https://github.com/mozilla/hubs/pull/4737>
- [Hubs] Better audio room defaults - <https://github.com/mozilla/hubs/pull/4817>\
- [Hubs] Search for scenes and avatars in admin panel - <https://github.com/mozilla/hubs/pull/4463>
  - HDR lightmaps & environment settings system - <https://github.co/mozilla/hubs/pull/4538>
    - [Community submitted!] [rawnsley] Scene with sample assets to check out this feature - <https://github.com/LearnHub/HubHenge>

Hubs

- Upgrade Three.js to r128 - <https://github.com/mozilla/hubs/pull/4321>  
- Device detection: iPad now detected as iOS - <https://github.com/mozilla/hubs/pull/4700> and Android tablet detected as tablet or mobile device - <https://github.com/mozilla/hubs/pull/4724>
- Twitter changes: Twitter popup window closes itself - <https://github.com/mozilla/hubs/pull/4824> / Twitter no longer links the room invite - <https://github.com/mozilla/hubs/pull/4812>
- Fixed transparency with personal space bubble (when you walk into an avatar) <https://github.com/mozilla/hubs/pull/4808>
- Fix billboard Y rotation <https://github.com/mozilla/hubs/pull/4781>
- Fix dark/light mode sprites <https://github.com/mozilla/hubs/pull/4778>
- [Community submitted!] [gfodor] Stop adding session id with every call to getMicrophonePresences <https://github.com/mozilla/hubs/pull/4798>
- Fix sign in prompt flow issues - <https://github.com/mozilla/hubs/pull/4745>
- Lazy media load on scene entry - <https://github.com/mozilla/hubs/pull/4135>
- Fixes audio issues for Safari
  - Fix audio files and choppy video audio - <https://github.com/mozilla/hubs/pull/4576>
  - Disable positional audio on safari to resolve distorted audio - <https://github.com/mozilla/hubs/pull/4594>
  - Temporary fix for audio distortion in Safari - <https://github.com/mozilla/hubs/pull/4441>
- Fix wrong transparency of hover menus - <https://github.com/mozilla/hubs/pull/4470>
- Expose client version to HC users - <https://github.com/mozilla/hubs/pull/4606>
- Fix audio-only elements not playing - <https://github.com/mozilla/hubs/pull/4683>
- Misc UI fixes
  - <https://github.com/mozilla/hubs/pull/4413>
  - <https://github.com/mozilla/hubs/pull/4650>
  - <https://github.com/mozilla/hubs/pull/4544>
- Landing page updates
  - <https://github.com/mozilla/hubs/pull/4479>
  - <https://github.com/mozilla/hubs/pull/4585>
  - <https://github.com/mozilla/hubs/pull/4602>
  - <https://github.com/mozilla/hubs/pull/4624>
- Dark mode/theme fixes
  - <https://github.com/mozilla/hubs/pull/4629>
  - <https://github.com/mozilla/hubs/pull/4649>
  - <https://github.com/mozilla/hubs/pull/4666>
  - <https://github.com/mozilla/hubs/pull/4692>
  - <https://github.com/mozilla/hubs/pull/4727>
  - <https://github.com/mozilla/hubs/pull/4747>
- [Community submitted!] [wmurphyrd] Fix cannot activate mic if last used mic no longer available - <https://github.com/mozilla/hubs/pull/4699>
- Fix pinning state changes - <https://github.com/mozilla/hubs/pull/4721>
- [Community submitted!] [rawnsley] Scene must be reset when fast switching - <https://github.com/mozilla/hubs/pull/4596>
- [Community submitted!] [rawnsley] Fix for URL waypoint fragments when using fast switching - <https://github.com/mozilla/hubs/pull/4597>
- Fixes for environment-settings system <https://github.com/mozilla/hubs/pull/4660>
- Fix material components using __mhc_link_type (video texture target in latest Blender exporter) - <https://github.com/mozilla/hubs/pull/4733>
- [Community submitted!] [rawnsley] Added missing space to match PeopleSidebar - <https://github.com/mozilla/hubs/pull/4333>
- [Community submitted!] [rawnsley] Fix forward and backward motion when using on-screen touch joysticks. - <https://github.com/mozilla/hubs/pull/4334>
- [Community submitted!] [StevenGastroSophy] isSignedIn should be a boolean, not credentials token(string) - <https://github.com/mozilla/hubs/pull/4349>
- [Community submitted!] [yakyouk] fix mobile touch coordinates - <https://github.com/mozilla/hubs/pull/4397>
- [Community submitted!] [yakyouk] fix permission token update, use dialog adapter token for kick - <https://github.com/mozilla/hubs/pull/4418>
- [Community submitted!] [rawnsley] Added more console logging to track progress during loading - <https://github.com/mozilla/hubs/pull/4569>
- [Community submitted!] [rawnsley] Keyboard.getLayoutMap() throws an exception in iFrame on Chrome - <https://github.com/mozilla/hubs/pull/4570> by
- [Community submitted!] [yakyouk] fix name tags not updating - <https://github.com/mozilla/hubs/pull/4654>
- [Community submitted!] [rawnsley] HubHenge scene to use to test lightmaps - <https://github.com/LearnHub/HubHenge>
- [Community submitted!] [wmurphyrd] Fix cannot activate mic if last used mic no longer available - <https://github.com/mozilla/hubs/pull/4699>
- Reticulum
- Restrict uploads - <https://github.com/mozilla/reticulum/pull/506>
- Upload domain restriction - <https://github.com/mozilla/reticulum/pull/508>
- Entry code redirect fixes - <https://github.com/mozilla/reticulum/pull/511> / <https://github.com/mozilla/reticulum/pull/515> / <https://github.com/mozilla/reticulum/pull/527>

Spoke

- Add support for __mhc_link_type node references in components - <https://github.com/mozilla/Spoke/pull/1177>
- Support overriding individual audio parameters - <https://github.com/mozilla/Spoke/pull/1175>
- Support for optional properties allow for properties to be fully optional and not be exported if they are not enabled - <https://github.com/mozilla/Spoke/pull/1185>

Thank you for the community contributions from:

- rawnsley
- yakyouk
- wmurphyrd
- StevenGastroSophy
- Gfodor

| Package versions                                           |
|------------------------------------------------------------|
| mozillareality/ita/0.0.1/20211117212826                    |
| mozillareality/reticulum/1.0.1/20220225005345              |
| mozillareality/hubs/1.0.0/20220225014625                   |
| mozillareality/pgbouncer/1.12.0/20191106234457             |
| mozillareality/spoke/1.0.0/20211125101704                  |
| mozillareality/certbot/1.0.0/20191224043510                |
| mozillareality/youtube-dl-api-server/0.4/20220217230007    |
| mozillareality/janus-gateway/2.0.1/20211220195030          |
| mozillareality/postgrest/5.2.0/20190130035107              |
| mozillareality/polycosm-static-assets/1.0.0/20200320162152 |
| mozillareality/coturn/4.5.3.0/20200422002445               |

2021-10-15
---------

AMI and Template changes

- Removes reliance on port 80 - allowing networks with 80 blocked, to access HC
- Fixes an ALB template issue
- Adds a cron job to clean up DNS hanging records
- Adds an additional stack output used in the next release

NOTE: Hubs Cloud template changes need to be [manually updated via this guide for existing stacks](https://hubs.mozilla.com/docs/hubs-cloud-aws-updating-the-stack.html#-upgrade-your-hubs-cloud-template-to-the-latest)

2021-08-24
----------

New Features

- Live Screens (beta) enabled in room via Blender add-on!- Add an in-room camera feed to a texture on an object so you can enable mirrors or large screens - <https://github.com/mozilla/hubs/pull/4126>
  - Full video <https://www.youtube.com/watch?v=oEc8ML2Q-z8>
  - How to use <https://www.youtube.com/watch?v=qMWjdxy2wrY>
- Community submitted! Better labels, text, and signs via GLTF rendered text elements - <https://github.com/mozilla/hubs/pull/4227>
  - Complementary with the Blender exporter add on - <https://github.com/MozillaReality/hubs-blender-exporter/pull/31>
- In world speakers and in world microphones! (only moderators and owners can use the mics) - <https://github.com/mozilla/hubs/pull/4237>
  - Blender add-on rlease notes: <https://github.com/MozillaReality/hubs-blender-exporter/releases/tag/v0_0_10>
- French translations - Community submitted! <https://github.com/mozilla/hubs/pull/3897>
- Removes support for Google Poly, Google Poly is shutting down June 30th, exposes Google Poly assets as a webpage so folks can download and upload them directly - <https://github.com/mozilla/hubs/pull/4306>

Performance Improvements

- Improved video performance in Firefox - <https://github.com/mozilla/hubs/pull/4210>
- Added audio workaround to increase audio quality and re-enable specialized audio in Chrome - will remove when chromium feature lands and the workaround is no longer needed - <https://github.com/mozilla/hubs/pull/4227>
- Better loading of fonts - Community submitted! Courtesy of Rawnsley <https://github.com/rawnsley> <https://github.com/mozilla/hubs/pull/4184/files>
- Updated Three.js glTF loader to the latest - <https://github.com/mozilla/hubs/pull/4198>
- Improved rendering for multisampled FBs in Chromium browser - <https://github.com/mozilla/hubs/pull/4255>
- Audio zone improvements, mods can now modify audio zone sources- <https://github.com/mozilla/hubs/pull/4278>
- Improved Chrome audio quality issues and got stereo working again! - <https://github.com/mozilla/hubs/pull/4275>
- Community submitted! Waypoint links no longer refresh the page when the current room is the same and fixes back button sending to last waypoint - <https://github.com/mozilla/hubs/pull/4272>
- Optimized SQL queries in the session_stats table - <https://github.com/mozilla/reticulum/pull/493>

Bug Fixes

- Fixes fake joining a room without joining not failing to join room with invalid credentials and smooths out webrtc and networked aframe rejoining - <https://github.com/mozilla/hubs/pull/3935>
- Shows mic selection on every join - Fixes joining a room with a saved mic that is no longer connected. - <https://github.com/mozilla/hubs/pull/4151>
- Fixes exiting VR mode in Oculus browser to exit correctly and manages disconnects from controllers correctly <https://github.com/mozilla/hubs/pull/4206>
- Remove error in mobile devices looking for KeyQ - Community submitted! rawnsley - <https://github.com/rawnsley> - <https://github.com/mozilla/hubs/pull/4177>
- Adds count to People menu button - Community submitted! MegaMotion = <https://github.com/MegaMotion> - <https://github.com/mozilla/hubs/pull/4199>
- Cloned lights point in the correct direction - <https://github.com/mozilla/hubs/pull/4253>
- Nested media frames place media in correct places - <https://github.com/mozilla/hubs/pull/4279>
- Community submitted! Remove create room "more menu" when it should be disabled - <https://github.com/mozilla/hubs/pull/4285>
- Community submitted! Allow spectate when the room is full - <https://github.com/mozilla/hubs/pull/4248>
- Community submitted! "Change scene" button shows after setting the scene from a GLB, previously button was hidden - <https://github.com/mozilla/hubs/pull/4235>
- Community submitted! Removed console error when setLocal is called - <https://github.com/mozilla/hubs/pull/4178>
- Community submitted! Renamed "copy avatar" to "save avatar" - <https://github.com/mozilla/hubs/pull/3942>
- Discord bot would attempt to connect to null or an invalid room url, catch and handle this error gracefully - <https://github.com/mozilla/reticulum/pull/494>
- Don't return null for deleted projectless scenes - <https://github.com/mozilla/reticulum/pull/498>

2021-04-19
----------

Reticulum:

- [experimental] The beginnings of a graphql API for managing rooms has been added behind a feature flag. There is no UI for generating credentials.
- mozillareality/reticulum/1.0.1/20210408151304
- <https://github.com/mozilla/reticulum/pull/492>

Hubs:

- New UI
- Multiple custom themes can be configured in the admin panel
- Webcam avatars and video target components
- Enable WebXR support for Windows Mixed Reality headsets in Google Chrome and Microsoft Edge
- mozillareality/hubs/1.0.0/20210408153100
- <https://github.com/mozilla/hubs/pull/4158>

Spoke:

- Add support for manually setting attributions on media.
- Disable elements to prevent them from being exported or being involved in nav-mesh calculation.
- Elements now collapse in the hierarchy to declutter your scene.
- Add billboard support to media
- Add support for custom nav meshes
- Add link behaviour to images/videos
- Add support for creating scenes directly from GLB
- mozillareality/spoke/1.0.0/20210315144242
- <https://github.com/mozilla/Spoke/pull/1132>

2021-02-02
----------

Reticulum:

- Added the ability to customize magic link email text in Admin Panel "Auth" tab
- 1.0.1/20210115134515 <https://github.com/mozilla/reticulum/pull/463>

Hubs:

- Type room name to confirm close room
- WebRTC Debugging panel
- Added the ability to customize magic link email text in Admin Panel "Auth" tab
- Brazilian Portuguese language support
- Spanish language support
- Japanese language improvements
- Russian language support
- Experimental dynamic audio normalization
- Increased the room occupant threshold where we stop reporting user entries and leaves from 12 to 30.
- Add preference to toggle gyroscope control
- Set quality setting with query string parameters
- Fallback to default local model when there is an avatar load error
- Fix missing avatar head on inspect bug
- Various fixes
- 1.0.0/20210115142723 <https://github.com/mozilla/hubs/pull/3851>

Spoke:

- Support multiple animations on a single model
- Allow toggling floating on objects from spawners
- Various fixes
- 1.0.0/20210115140717 <https://github.com/mozilla/Spoke/pull/1095>

2020-10-13
----------

Reticulum:

- Admin panel now redirects you to the homepage if you are not logged in as an admin
- Fix for CSP issue with Google Analytics
- 1.0.20201012230301 <https://github.com/mozilla/reticulum/pull/422>

Hubs:

- Add media frames
- Redirect non-admin users away from the admin panel
- Add Japanese language support
- Inspect avatars
- 1.0.0.20201002202739 <https://github.com/mozilla/hubs/pull/3165>

Spoke:

- Add media frames
- 1.0.0.20200930005646 <https://github.com/mozilla/Spoke/pull/1042>

2020-09-11
----------

Reticulum:

- Fixed backwards compatibility with older clients. This was an update to reticulum to fix compatibility for older custom clients.
- mozillareality/reticulum/1.0.1/20200911183406 <https://github.com/mozilla/reticulum/pull/414>

2020-09-08
----------

Reticulum:

- Hub Invites: Added Hub Invites, which allows us to restrict access to rooms when they are in the :invite entry<sub>mode</sub>
- Clearer error messages for streaming failures: Sharing media from popular streaming sites often fails for reasons beyond our control. We've added clearer messaging for when this happens.
- mozillareality/reticulum/1.0.1/20200817225751 <https://github.com/mozilla/reticulum/pull/411>

Hubs:

- Hub Invite Links: A room can now be set to "Invite only", which then generates an invite link that allows room access. The invite link can be revoked, or the room can be put back into "Private" mode. If a user attempts to enter a room without an invite id, they are denied access and shown our typical black room entry denial screen.
- Waypoint Improvements: You can now use links to teleport between waypoints in the scene.
- Medium quality mode: The medium quality mode is targeted at improving performance and graphics quality on budget desktops/laptops and mobile devices.
- Improved Accessibility for main UI: ARIA roles and labels have been added to several buttons and elements in the room UI. Tested with NVDA screen reader.
- Basic non-English language support: There is now a user preference for setting language and instructions for how to submit translation files to be reviewed and added to the app.
- mozillareality/hubs/1.0.0/20200908210500 <https://github.com/mozilla/hubs/pull/2990>

Spoke:

- Scene Preview Camera Node: The Scene Preview Camera Node can be placed in your scene and will be used to position the camera when generating thumbnails or previewing the scene in Hubs.
- mozillareality/spoke/1.0.0/20200803233608 <https://github.com/mozilla/Spoke/pull/1022>

2020-07-21
----------

Reticulum:

- Do not show favorite rooms that have been closed
- 1.0.1/20200715190503

Hubs:

- Fix avatar previews on iOS
- Remove delete buttons from admin panel
- Add preference for preferred camera
- 1.0.0/20200722000012

Spoke:

- Fixes for models exported by the Blender exporter
- Add "alpha mode" setting for images
- 1.0.0/20200707224342

2020-06-12
----------

Reticulum:

- Fix issues with default room feature
- Add dropbox support
  
Hubs:

- Performance improvements in physics
- Support for new Mediasoup-based SFU, dialog
- Preferences dialog reorganized
- Added gltF UV-scrolling

2020-05-26
----------

Hubs:

- New NAF Janus adapter changes to support retries
- New mobile UI for object list
- Fix shrink command
- Enabled desktop audio mixing through avatar

2020-05-18
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

2020-04-22
----------

Reticulum:

- Pre-TURN maintenence release
- Fix error when changing scenes due to ecto issue: <https://github.com/elixir-ecto/ecto/issues/3246#issuecomment-616080541> <https://github.com/mozilla/reticulum/pull/367>

2020-04-16
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
