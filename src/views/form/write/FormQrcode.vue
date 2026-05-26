<template>
  <div class="qrcode-box">
    <div class="qrcode-card">
      <div class="qrcode-canvas-wrapper">
        <vue-qr v-if="codeUrl" :text="codeUrl" :margin="0" class="qrcode-canvas" />
      </div>
      <div class="qrcode-text-group">
        <div class="qrcode-subtitle">支持微信或浏览器扫码</div>
      </div>
    </div>
  </div>
</template>

<script>
import VueQr from 'vue-qr'

export default {
  name: 'FormQrcode',
  components: {
    VueQr
  },
  data() {
    return {
      codeUrl: ''
    }
  },
  created() {
    this.codeUrl = location.href
  }
}
</script>

<style lang="scss" scoped>
.qrcode-box {
  position: fixed;
  left: 50%;
  top: 60px;
  margin-left: 450px;
  z-index: 100;
  // 优雅的淡入滑落入场动画
  animation: qrcode-fade-in-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.qrcode-card {
  width: 148px;
  background: #ffffff;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.09);
    border-color: #e2e8f0;
  }
}

/* 保护框展台卡槽 */
.qrcode-canvas-wrapper {
  width: 116px;
  height: 116px;
  background: #f8fafc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  box-sizing: border-box;
  padding: 8px;
  transition: background-color 0.3s;

  .qrcode-canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
    border-radius: 4px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.02));
  }
}

.qrcode-card:hover .qrcode-canvas-wrapper {
  background-color: #f1f5f9;
}

/* 文字引导组 */
.qrcode-text-group {
  margin-top: 12px;
  text-align: center;
  width: 100%;
}

.qrcode-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.4;

  i {
    font-size: 14px;
    color: #3b82f6;
    transition: transform 0.3s;
  }
}

.qrcode-card:hover .qrcode-title i {
  transform: scale(1.15) translateY(-1px);
}

.qrcode-subtitle {
  font-size: 10px;
  color: #94a3b8;
  margin-top: 4px;
  font-weight: 500;
  white-space: nowrap;
}

/* 关键帧入场动效 */
@keyframes qrcode-fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式截断隐藏 */
@media screen and (max-width: 1024px) {
  .qrcode-box {
    display: none;
  }
}
</style>
