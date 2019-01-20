FROM gitpod/workspace-full

USER root
# Install custom tools, runtime, etc.
RUN apt-get update && apt-get install -y libsdl2-dev\
    && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

USER gitpod
RUN git clone https://github.com/juj/emsdk.git /tmp/em && cd /tmp/em && /tmp/em/emsdk install latest && /tmp/em/emsdk activate latest
