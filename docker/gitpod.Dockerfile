FROM gitpod/workspace-full

USER root
# Install custom tools, runtime, etc.
RUN apt-get update && apt-get install -y libsdl2-dev\
    && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*

USER gitpod
RUN git clone https://github.com/juj/emsdk.git /home/gitpod/em && cd /home/gitpod/em && /home/gitpod/em/emsdk install latest && /home/gitpod/em/emsdk activate latest
