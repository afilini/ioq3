var LibraryOpenAL = {
    $AL__deps: ['$Browser'],
    $AL: {
      contexts: [],
      currentContext: null,
      QUEUE_INTERVAL: 25,
      QUEUE_LOOKAHEAD: 100,

      updateSources: function updateSources(context) {
        for (var i = 0; i < context.src.length; i++) {
          AL.updateSource(context.src[i]);
        }
      },

      updateSource: function updateSource(src) {



        if (src.state !== 0x1012 ) {
          return;
        }

        var currentTime = AL.currentContext.ctx.currentTime;
        var startTime = src.bufferPosition;

        for (var i = src.buffersPlayed; i < src.queue.length; i++) {
          var entry = src.queue[i];

          var startOffset = startTime - currentTime;
          var endTime = startTime + entry.buffer.duration;


          if (currentTime >= endTime) {

            src.bufferPosition = endTime;
            src.buffersPlayed = i + 1;


            if (src.buffersPlayed >= src.queue.length) {
              if (src.loop) {
                AL.setSourceState(src, 0x1012 );
              } else {
                AL.setSourceState(src, 0x1014 );
              }
            }
          }

          else if (startOffset < (AL.QUEUE_LOOKAHEAD / 1000) && !entry.src) {

            var offset = Math.abs(Math.min(startOffset, 0));

            entry.src = AL.currentContext.ctx.createBufferSource();
            entry.src.buffer = entry.buffer;
            entry.src.connect(src.gain);
            entry.src.start(startTime, offset);




          }

          startTime = endTime;
        }
      },

      setSourceState: function setSourceState(src, state) {



        if (state === 0x1012 ) {
          if (src.state !== 0x1013 ) {
            src.state = 0x1012 ;

            src.bufferPosition = AL.currentContext.ctx.currentTime;
            src.buffersPlayed = 0;



          } else {
            src.state = 0x1012 ;

            src.bufferPosition = AL.currentContext.ctx.currentTime - src.bufferPosition;



          }
          AL.stopSourceQueue(src);
          AL.updateSource(src);
        } else if (state === 0x1013 ) {
          if (src.state === 0x1012 ) {
            src.state = 0x1013 ;

            src.bufferPosition = AL.currentContext.ctx.currentTime - src.bufferPosition;
            AL.stopSourceQueue(src);



          }
        } else if (state === 0x1014 ) {
          if (src.state !== 0x1011 ) {
            src.state = 0x1014 ;
            src.buffersPlayed = src.queue.length;
            AL.stopSourceQueue(src);



          }
        } else if (state == 0x1011 ) {
          if (src.state !== 0x1011 ) {
            src.state = 0x1011 ;
            src.bufferPosition = 0;
            src.buffersPlayed = 0;



          }
        }
      },

      stopSourceQueue: function stopSourceQueue(src) {
        for (var i = 0; i < src.queue.length; i++) {
          var entry = src.queue[i];
          if (entry.src) {
            entry.src.stop(0);
            entry.src = null;
          }
        }
      }
    },

    alcProcessContext: function(context) {},
    alcSuspendContext: function(context) {},

    alcMakeContextCurrent: function(context) {
      if (context == 0) {
        AL.currentContext = null;
        return 0;
      } else {
        AL.currentContext = AL.contexts[context - 1];
        return 1;
      }
    },

    alcGetContextsDevice: function(context) {
      if (context <= AL.contexts.length && context > 0) {

        return 1;
      }
      return 0;
    },

    alcGetCurrentContext: function() {
      for (var i = 0; i < AL.contexts.length; ++i) {
        if (AL.contexts[i] == AL.currentContext) {
          return i + 1;
        }
      }
      return 0;
    },

    alcDestroyContext: function(context) {

      clearInterval(AL.contexts[context - 1].interval);
    },

    alcCloseDevice: function(device) {

    },

    alcOpenDevice: function(deviceName) {
      if (typeof(AudioContext) == "function" ||
          typeof(webkitAudioContext) == "function") {
        return 1;
      } else {
        return 0;
      }
    },

    alcCreateContext__deps: ['updateSources'],
    alcCreateContext: function(device, attrList) {
      if (device != 1) {
        return 0;
      }

      if (attrList) {



        return 0;
      }

      var ctx;
      try {
        ctx = new AudioContext();
      } catch (e) {
        try {
          ctx = new webkitAudioContext();
        } catch (e) {}
      }

      if (ctx) {
        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        var context = {
          ctx: ctx,
          err: 0,
          src: [],
          buf: [],
          interval: [],//setInterval(function() { AL.updateSources(context); }, AL.QUEUE_INTERVAL),
          gain: gain
        };
        AL.contexts.push(context);
        return AL.contexts.length;
      } else {
        return 0;
      }
    },

    alGetError: function() {
      if (!AL.currentContext) {
        return 0xA004 ;
      } else {

        var err = AL.currentContext.err;
        AL.currentContext.err = 0 ;
        return err;
      }
    },

    alcGetError__deps: ['alGetError'],
    alcGetError: function(device) {

      return _alGetError();
    },

    alDeleteSources: function(count, sources) {
      if (!AL.currentContext) {



        return;
      }
      for (var i = 0; i < count; ++i) {
        var sourceIdx = {{{ makeGetValue('sources', 'i*4', 'i32') }}} - 1;
        delete AL.currentContext.src[sourceIdx];
      }
    },

    alGenSources: function(count, sources) {
      if (!AL.currentContext) {



        return;
      }
      for (var i = 0; i < count; ++i) {
        var gain = AL.currentContext.ctx.createGain();
        gain.connect(AL.currentContext.gain);
        AL.currentContext.src.push({
          state: 0x1011 ,
          queue: [],
          loop: false,
          get refDistance() {
            return this._refDistance || 1;
          },
          set refDistance(val) {
            this._refDistance = val;
            if (this.panner) this.panner.refDistance = val;
          },
          get maxDistance() {
            return this._maxDistance || 10000;
          },
          set maxDistance(val) {
            this._maxDistance = val;
            if (this.panner) this.panner.maxDistance = val;
          },
          get rolloffFactor() {
            return this._rolloffFactor || 1;
          },
          set rolloffFactor(val) {
            this._rolloffFactor = val;
            if (this.panner) this.panner.rolloffFactor = val;
          },
          get position() {
            return this._position || [0, 0, 0];
          },
          set position(val) {
            this._position = val;
            if (this.panner) this.panner.setPosition(val[0], val[1], val[2]);
          },
          get velocity() {
            return this._velocity || [0, 0, 0];
          },
          set velocity(val) {
            this._velocity = val;
            // if (this.panner) this.panner.setVelocity(val[0], val[1], val[2]);
          },
          get direction() {
            return this._direction || [0, 0, 0];
          },
          set direction(val) {
            this._direction = val;
            if (this.panner) this.panner.setOrientation(val[0], val[1], val[2]);
          },
          get coneOuterGain() {
            return this._coneOuterGain || 0.0;
          },
          set coneOuterGain(val) {
            this._coneOuterGain = val;
            if (this.panner) this.panner.coneOuterGain = val;
          },
          get coneInnerAngle() {
            return this._coneInnerAngle || 360.0;
          },
          set coneInnerAngle(val) {
            this._coneInnerAngle = val;
            if (this.panner) this.panner.coneInnerAngle = val;
          },
          get coneOuterAngle() {
            return this._coneOuterAngle || 360.0;
          },
          set coneOuterAngle(val) {
            this._coneOuterAngle = val;
            if (this.panner) this.panner.coneOuterAngle = val;
          },
          gain: gain,
          panner: null,
          buffersPlayed: 0,
          bufferPosition: 0
        });
        {{{ makeSetValue('sources', 'i*4', 'AL.currentContext.src.length', 'i32') }}};
      }
    },

    alSourcei__deps: ['updateSource'],
    alSourcei: function(source, param, value) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      switch (param) {
      case 0x1001 :
        src.coneInnerAngle = value;
        break;
      case 0x1002 :
        src.coneOuterAngle = value;
        break;
      case 0x1007 :
        src.loop = (value === 1 );
        break;
      case 0x1009 :
        var buffer = AL.currentContext.buf[value - 1];
        if (value == 0) {
          src.queue = [];
        } else {
          src.queue = [{ buffer: buffer }];
        }
        AL.updateSource(src);
        break;
      case 0x202 :
        if (value === 1 ) {
          if (src.panner) {
            src.panner = null;


            src.gain.disconnect();

            src.gain.connect(AL.currentContext.ctx.destination);
          }
        } else if (value === 0 ) {
          if (!src.panner) {
            var panner = src.panner = AL.currentContext.ctx.createPanner();
            panner.panningModel = "equalpower";
            panner.distanceModel = "linear";
            panner.refDistance = src.refDistance;
            panner.maxDistance = src.maxDistance;
            panner.rolloffFactor = src.rolloffFactor;
            panner.setPosition(src.position[0], src.position[1], src.position[2]);
            // panner.setVelocity(src.velocity[0], src.velocity[1], src.velocity[2]);
            panner.connect(AL.currentContext.ctx.destination);


            src.gain.disconnect();

            src.gain.connect(panner);
          }
        } else {
          AL.currentContext.err = 0xA003 ;
        }
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alSourcef: function(source, param, value) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      switch (param) {
      case 0x1003 :



        break;
      case 0x100A :
        src.gain.gain.value = value;
        break;




      case 0x1023 :
        src.maxDistance = value;
        break;
      case 0x1021 :
        src.rolloffFactor = value;
        break;
      case 0x1022 :
        src.coneOuterGain = value;
        break;
      case 0x1001 :
        src.coneInnerAngle = value;
        break;
      case 0x1002 :
        src.coneOuterAngle = value;
        break;
      case 0x1020 :
        src.refDistance = value;
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alSource3f: function(source, param, v1, v2, v3) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      switch (param) {
      case 0x1004 :
        src.position = [v1, v2, v3];
        break;
      case 0x1005 :
        src.direction = [v1, v2, v3];
        break;
      case 0x1006 :
        src.velocity = [v1, v2, v3];
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alSourcefv__deps: ['alSource3f'],
    alSourcefv: function(source, param, value) {
      _alSource3f(source, param,
        {{{ makeGetValue('value', '0', 'float') }}},
        {{{ makeGetValue('value', '4', 'float') }}},
        {{{ makeGetValue('value', '8', 'float') }}});
    },

    alSourceQueueBuffers__deps: ["updateSource"],
    alSourceQueueBuffers: function(source, count, buffers) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      for (var i = 0; i < count; ++i) {
        var bufferIdx = {{{ makeGetValue('buffers', 'i*4', 'i32') }}};
        if (bufferIdx > AL.currentContext.buf.length) {



          AL.currentContext.err = 0xA001 ;
          return;
        }
      }

      for (var i = 0; i < count; ++i) {
        var bufferIdx = {{{ makeGetValue('buffers', 'i*4', 'i32') }}};
        var buffer = AL.currentContext.buf[bufferIdx - 1];
        src.queue.push({ buffer: buffer, src: null });
      }

      AL.updateSource(src);
    },

    alSourceUnqueueBuffers__deps: ["updateSource"],
    alSourceUnqueueBuffers: function(source, count, buffers) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }

      if (count > src.buffersPlayed) {
        AL.currentContext.err = 0xA003 ;
        return;
      }

      for (var i = 0; i < count; i++) {
        var entry = src.queue.shift();

        for (var j = 0; j < AL.currentContext.buf.length; j++) {
          var b = AL.currentContext.buf[j];
          if (b && b == entry.buffer) {
            {{{ makeSetValue('buffers', 'i*4', 'j+1', 'i32') }}};
            break;
          }
        }
        src.buffersPlayed--;
      }

      AL.updateSource(src);
    },

    alDeleteBuffers: function(count, buffers)
    {
      if (!AL.currentContext) {



        return;
      }
      if (count > AL.currentContext.buf.length) {
        AL.currentContext.err = 0xA003 ;
        return;
      }

      for (var i = 0; i < count; ++i) {
        var bufferIdx = {{{ makeGetValue('buffers', 'i*4', 'i32') }}} - 1;


        if (bufferIdx >= AL.currentContext.buf.length || !AL.currentContext.buf[bufferIdx]) {
          AL.currentContext.err = 0xA001 ;
          return;
        }


        var buffer = AL.currentContext.buf[bufferIdx];
        for (var j = 0; j < AL.currentContext.src.length; ++j) {
          var src = AL.currentContext.src[j];
          if (!src) {
            continue;
          }
          for (var k = 0; k < src.queue.length; k++) {
            if (buffer === src.queue[k].buffer) {
              AL.currentContext.err = 0xA004 ;
              return;
            }
          }
        }
      }

      for (var i = 0; i < count; ++i) {
        var bufferIdx = {{{ makeGetValue('buffers', 'i*4', 'i32') }}} - 1;
        delete AL.currentContext.buf[bufferIdx];
      }
    },

    alGenBuffers: function(count, buffers) {
      if (!AL.currentContext) {



        return;
      }
      for (var i = 0; i < count; ++i) {
        AL.currentContext.buf.push(null);
        {{{ makeSetValue('buffers', 'i*4', 'AL.currentContext.buf.length', 'i32') }}};
      }
    },

    alIsBuffer: function(bufferId) {
      if (!AL.currentContext) {
        return false;
      }
      if (bufferId > AL.currentContext.buf.length) {
        return false;
      }

      if (!AL.currentContext.buf[bufferId - 1]) {
        return false;
      } else {
        return true;
      }
    },

    alBufferData: function(buffer, format, data, size, freq) {
      if (!AL.currentContext) {



        return;
      }
      if (buffer > AL.currentContext.buf.length) {



        return;
      }
      var channels, bytes;
      switch (format) {
      case 0x1100 :
        bytes = 1;
        channels = 1;
        break;
      case 0x1101 :
        bytes = 2;
        channels = 1;
        break;
      case 0x1102 :
        bytes = 1;
        channels = 2;
        break;
      case 0x1103 :
        bytes = 2;
        channels = 2;
        break;
      default:



        return;
      }
      try {
        AL.currentContext.buf[buffer - 1] = AL.currentContext.ctx.createBuffer(channels, size / (bytes * channels), freq);
      } catch (e) {
        AL.currentContext.err = 0xA003 ;
        return;
      }
      var buf = new Array(channels);
      for (var i = 0; i < channels; ++i) {
        buf[i] = AL.currentContext.buf[buffer - 1].getChannelData(i);
      }
      for (var i = 0; i < size / (bytes * channels); ++i) {
        for (var j = 0; j < channels; ++j) {
          switch (bytes) {
          case 1:
            var val = {{{ makeGetValue('data', 'i*channels+j', 'i8') }}} & 0xff;
            buf[j][i] = -1.0 + val * (2/256);
            break;
          case 2:
            var val = {{{ makeGetValue('data', '2*(i*channels+j)', 'i16') }}};
            buf[j][i] = val/32768;
            break;
          }
        }
      }
    },

    alSourcePlay__deps: ['setSourceState'],
    alSourcePlay: function(source) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      AL.setSourceState(src, 0x1012 );
    },

    alSourceStop__deps: ['setSourceState'],
    alSourceStop: function(source) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      AL.setSourceState(src, 0x1014 );
    },

    alSourcePause__deps: ['setSourceState'],
    alSourcePause: function(source) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      AL.setSourceState(src, 0x1013 );
    },

    alGetSourcei__deps: ['updateSource'],
    alGetSourcei: function(source, param, value) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }







      AL.updateSource(src);

      switch (param) {
      case 0x202 :
        {{{ makeSetValue('value', '0', 'src.panner ? 1 : 0', 'i32') }}};
        break;
      case 0x1001 :
        {{{ makeSetValue('value', '0', 'src.coneInnerAngle', 'i32') }}};
        break;
      case 0x1002 :
        {{{ makeSetValue('value', '0', 'src.coneOuterAngle', 'i32') }}};
        break;
      case 0x1009 :
        if (!src.queue.length) {
          {{{ makeSetValue('value', '0', '0', 'i32') }}};
        } else {

          var buffer = src.queue[src.buffersPlayed].buffer;

          for (var i = 0; i < AL.currentContext.buf.length; ++i) {
            if (buffer == AL.currentContext.buf[i]) {
              {{{ makeSetValue('value', '0', 'i+1', 'i32') }}};
              return;
            }
          }
          {{{ makeSetValue('value', '0', '0', 'i32') }}};
        }
        break;
      case 0x1010 :
        {{{ makeSetValue('value', '0', 'src.state', 'i32') }}};
        break;
      case 0x1015 :
        {{{ makeSetValue('value', '0', 'src.queue.length', 'i32') }}}
        break;
      case 0x1016 :
        if (src.loop) {
          {{{ makeSetValue('value', '0', '0', 'i32') }}}
        } else {
          {{{ makeSetValue('value', '0', 'src.buffersPlayed', 'i32') }}}
        }
        break;
      default:
        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alGetSourcef: function(source, param, value) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      switch (param) {


      case 0x100A :
        {{{ makeSetValue('value', '0', 'src.gain.gain.value', 'float') }}}
        break;




      case 0x1023 :
        {{{ makeSetValue('value', '0', 'src.maxDistance', 'float') }}}
        break;
      case 0x1021 :
        {{{ makeSetValue('value', '0', 'src.rolloffFactor', 'float') }}}
        break;
      case 0x1022 :
        {{{ makeSetValue('value', '0', 'src.coneOuterGain', 'float') }}}
        break;
      case 0x1001 :
        {{{ makeSetValue('value', '0', 'src.coneInnerAngle', 'float') }}}
        break;
      case 0x1002 :
        {{{ makeSetValue('value', '0', 'src.coneOuterAngle', 'float') }}}
        break;
      case 0x1020 :
        {{{ makeSetValue('value', '0', 'src.refDistance', 'float') }}}
        break;






      default:
        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alGetSourcefv: function(source, param, values) {
      if (!AL.currentContext) {



        return;
      }
      var src = AL.currentContext.src[source - 1];
      if (!src) {



        AL.currentContext.err = 0xA001 ;
        return;
      }
      switch (param) {
      case 0x1004 :
        var position = src.position;
        {{{ makeSetValue('values', '0', 'position[0]', 'float') }}}
        {{{ makeSetValue('values', '4', 'position[1]', 'float') }}}
        {{{ makeSetValue('values', '8', 'position[2]', 'float') }}}
        break;
      case 0x1005 :
        var direction = src.direction;
        {{{ makeSetValue('values', '0', 'direction[0]', 'float') }}}
        {{{ makeSetValue('values', '4', 'direction[1]', 'float') }}}
        {{{ makeSetValue('values', '8', 'direction[2]', 'float') }}}
        break;
      case 0x1006 :
        var velocity = src.velocity;
        {{{ makeSetValue('values', '0', 'velocity[0]', 'float') }}}
        {{{ makeSetValue('values', '4', 'velocity[1]', 'float') }}}
        {{{ makeSetValue('values', '8', 'velocity[2]', 'float') }}}
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alDistanceModel: function(model) {
      if (model !== 0 ) {



      }
    },

    alGetListenerf: function(pname, values) {
      if (!AL.currentContext) {



        return;
      }
      switch (pname) {
      case 0x100A :
        {{{ makeSetValue('value', '0', 'AL.currentContext.gain.gain', 'float') }}}
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }

    },

    alGetListenerfv: function(pname, values) {
      if (!AL.currentContext) {



        return;
      }
      switch (pname) {
      case 0x1004 :
        var position = AL.currentContext.ctx.listener._position || [0,0,0];
        {{{ makeSetValue('values', '0', 'position[0]', 'float') }}}
        {{{ makeSetValue('values', '4', 'position[1]', 'float') }}}
        {{{ makeSetValue('values', '8', 'position[2]', 'float') }}}
        break;
      case 0x1006 :
        var velocity = AL.currentContext.ctx.listener._velocity || [0,0,0];
        {{{ makeSetValue('values', '0', 'velocity[0]', 'float') }}}
        {{{ makeSetValue('values', '4', 'velocity[1]', 'float') }}}
        {{{ makeSetValue('values', '8', 'velocity[2]', 'float') }}}
        break;
      case 0x100F :
        var orientation = AL.currentContext.ctx.listener._orientation || [0,0,0,0,0,0];
        {{{ makeSetValue('values', '0', 'orientation[0]', 'float') }}}
        {{{ makeSetValue('values', '4', 'orientation[1]', 'float') }}}
        {{{ makeSetValue('values', '8', 'orientation[2]', 'float') }}}
        {{{ makeSetValue('values', '12', 'orientation[3]', 'float') }}}
        {{{ makeSetValue('values', '16', 'orientation[4]', 'float') }}}
        {{{ makeSetValue('values', '20', 'orientation[5]', 'float') }}}
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alGetListeneri: function(pname, value) {
      if (!AL.currentContext) {



        return;
      }
      switch (pname) {
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alListenerf: function(param, value) {
      if (!AL.currentContext) {



        return;
      }
      switch (param) {
      case 0x100A :
        AL.currentContext.gain.value = value;
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alEnable: function(param) {
      if (!AL.currentContext) {



        return;
      }
      switch (param) {
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alDisable: function(param) {
      if (!AL.currentContext) {



        return;
      }
      switch (pname) {
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alListenerfv: function(param, values) {
      if (!AL.currentContext) {



        return;
      }
      switch (param) {
      case 0x1004 :
        var x = {{{ makeGetValue('values', '0', 'float') }}};
        var y = {{{ makeGetValue('values', '4', 'float') }}};
        var z = {{{ makeGetValue('values', '8', 'float') }}};
        AL.currentContext.ctx.listener._position = [x, y, z];
        AL.currentContext.ctx.listener.setPosition(x, y, z);
        break;
      case 0x1006 :
        var x = {{{ makeGetValue('values', '0', 'float') }}};
        var y = {{{ makeGetValue('values', '4', 'float') }}};
        var z = {{{ makeGetValue('values', '8', 'float') }}};
        AL.currentContext.ctx.listener._velocity = [x, y, z];
        // AL.currentContext.ctx.listener.setVelocity(x, y, z);
        break;
      case 0x100F :
        var x = {{{ makeGetValue('values', '0', 'float') }}};
        var y = {{{ makeGetValue('values', '4', 'float') }}};
        var z = {{{ makeGetValue('values', '8', 'float') }}};
        var x2 = {{{ makeGetValue('values', '12', 'float') }}};
        var y2 = {{{ makeGetValue('values', '16', 'float') }}};
        var z2 = {{{ makeGetValue('values', '20', 'float') }}};
        AL.currentContext.ctx.listener._orientation = [x, y, z, x2, y2, z2];
        AL.currentContext.ctx.listener.setOrientation(x, y, z, x2, y2, z2);
        break;
      default:



        AL.currentContext.err = 0xA002 ;
        break;
      }
    },

    alIsExtensionPresent: function(extName) {
      return 0;
    },

    alcIsExtensionPresent: function(device, extName) {
      return 0;
    },

    alGetString: function(param) {
      return allocate(intArrayFromString('NA'), 'i8', ALLOC_NORMAL);
    },

    alGetProcAddress: function(fname) {
      return 0;
    },

    alcGetString: function(param) {
      return allocate(intArrayFromString('NA'), 'i8', ALLOC_NORMAL);
    },

    alcGetProcAddress: function(device, fname) {
      return 0;
    },

    alDopplerFactor: function(value) {
    },

    alDopplerVelocity: function(value) {
    }
  };

  autoAddDeps(LibraryOpenAL, '$AL');
  mergeInto(LibraryManager.library, LibraryOpenAL);
