<template>
  <div class="goeasy-audio-player" @click="playAudio">
    <div :style="{width:Math.ceil(duration)*7 + 50 + 'px'}" class="audio-facade">
      <div :class="{'play-icon':play}" class="audio-facade-bg"></div>
      <div>{{ Math.ceil(duration) || 1 }}<span>"</span></div>
    </div>
  </div>
</template>

<script>
  const innerAudioContext = uni.createInnerAudioContext();
  export default {
    name: "GoEasyAudioPlayer",
    props: ['src', 'duration'],
    data() {
      return {
        play: false
      }
    },
    methods: {
      playAudio() {
        this.play = true;
        innerAudioContext.src = this.src;
        innerAudioContext.play();
        setTimeout(() => {
          this.play = false;
        }, this.duration * 1000)
      }
    }
  }
</script>

<style scoped>
  .goeasy-audio-player {
    height: 86 rpx;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  .audio-facade {
    min-width: 20 rpx;
    padding: 6 rpx 10 rpx;
    line-height: 72 rpx;
    background: #EFEFEF;
    font-size: 24 rpx;
    border-radius: 14 rpx;
    color: #000000;
    display: flex;
    flex-direction: row-reverse;
  }

  .audio-facade-bg {
    background: url("/static/images/voice.png") no-repeat center;
    background-size: 30 rpx;
    width: 40 rpx;
    transform: rotate(180deg);
  }

  .audio-facade-bg.play-icon {
    background: url("/static/images/play.gif") no-repeat center;
    background-size: 30 rpx;
  }
</style>
