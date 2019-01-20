# IOQUAKE3 on browsers

The goal of this branch is to update https://github.com/ioquake/ioq3 to the latest version of emscripten and ioquake3.


##

    $ npm install -g http-server
    $ make PLATFORM=browser EMSCRIPTEN=/home/gitpod/em/emscripten/.../bin
    $ cd /workspace/ioq3/build/release-browser-wasm
    $ wget http://content.quakejs.com/assets/857908472-linuxq3ademo-1.11-6.x86.gz.sh
    $ wget http://content.quakejs.com/assets/296843703-linuxq3apoint-1.32b-3.x86.run
    $wget https://www.ioquake3.org/data/quake3-latest-pk3s.zip
    $ curl 'https://www.ioquake3.org/data/quake3-latest-pk3s.zip' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'Upgrade-Insecure-Requests: 1' -H 'DNT: 1' -H 'User-Agent: Mozilla/5.0 (X11; CrOS x86_64 11151.113.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.127 Safari/537.36' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'Referer: https://ioquake3.org/extras/patch-data/' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: vi,en-US;q=0.9,en;q=0.8' --compressed --output hi.zip
    $ unzip hi.zip
    $ cp quake3-latest-pk3s/baseq3/pak* ./foobar/

## Gitpod

Activate emscripten environment:

    $ source /home/gitpod/em/emsdk_env.sh


## Progress

- [ ] fixed formatting of a few GLSL float constants  … 2ac3023
- [ ] broke up main event loop to work in emscripten a8f2107
- [ ] added emscripten platform 6b58f05
- [ ] added emscripten conditionals to renderer to get it running  … 5da05a3
- [ ] disable MD3 lods d0707de
- [ ] async-ified FS_Startup 914e317
- [ ] added JS platform to build 1a8780c
- [ ] misc SDL fixes until SDL 1.2 headers are fixed in emscripten 72443ef
- [ ] added get / set methods for stdinIsATTY so it can be accessed by the … … 69e7b58
- [ ] don't use default master servers 3141bb6
- [ ] use different default sound due to so many missing assets 0f2df82
- [ ] added CDN support to client 936a4bf
- [ ] updated entrypoint definitions to compile properly with emscripten f1e4e02
- [ ] namespaced libc functions in bg_lib to prevent collisions with emscri… … c052edd
- [ ] added major vid_restart fast hack to enable responsive window resizing cf43403
- [ ] rough first pass at JS vm compiler fa1481f
- [ ] temporary renderer workaround for https://bugzilla.icculus.org/show_b… … d2d94af
- [ ] replace usage of glAlphaFunc inside fragment shaders 6870e93
- [ ] added suspend / resume support to the JS VM code  … f54f7ff
- [ ] use a random net_port for emscripten builds to support running multip… … 37df7c2
- [ ] don't generate shaders for LIGHTDEF_USE_SHADOWMAP when r_sunlightMode… … 39b1104
- [ ] don't regenerate GLSL shaders unless required 4f7d7bf