<template>
  <div class='black_container'>
    <!-- 关闭预览按钮 -->
    <div class="esc_preview">
      <span @click="closePreview"><i class="el-icon-close"></i></span>
    </div>

    <!-- 标题栏 -->
    <div v-if="title !== '' && title !== undefined" class="image_title">{{title}}</div>

    <!-- 图片栏 -->
    <div class="preview_img full_screenStyle">

      <!-- // 上一个按钮 -->
      <span class="btn_prev" @click="previewClick('prev')">
        <i class="el-icon-arrow-left"></i>
      </span>

      <!-- 预览的图片 -->
      <img v-show="hideStyleChange" class="current_image" :style="{'transform': imgTransform, 'margin-left': styleObj.left, 'margin-top': styleObj.top}" :src="url" alt="" :onerror="onerror">

      <!-- // 下一个按钮 -->
      <span class="btn_next" @click="previewClick('next')">
        <i class="el-icon-arrow-right"></i>
      </span>
    </div>

    <!-- 缩略图展示栏 -->
    <div class="miniPicBox" :style="{'width': miniPicBoxWidth}">
      <div class="hide_parentBox">
        <ul class="shufflingBox" :style="{'left': shufflingLeft}">
          <!-- 无缝轮播的展示图片 -->
          <li v-if="lengthFlag" @click="changeMiniCurrent(length - 2, -3)" class="miniPic">
            <img :src="imageKeys[length - 3]" alt="">
          </li>
          <li v-if="lengthFlag" @click="changeMiniCurrent(length - 2, -2)" class="miniPic">
            <img :src="imageKeys[length - 2]" alt="">
          </li>
          <li v-if="lengthFlag" @click="changeMiniCurrent(length - 1, -1)" class="miniPic">
            <img :src="imageKeys[length - 1]" alt="">
          </li>

          <!-- 缩略图片 -->
          <li :key="index" v-for="(item, index) in imageKeys" @click="changeMiniCurrent(index)" :class="['miniPic', index === currentIndex ? 'currentImage' : '']">
            <img :src="item" alt="">
          </li>

          <!-- 无缝轮播的展示图片 -->
          <li v-if="lengthFlag" @click="changeMiniCurrent(0, length)" class="miniPic">
            <img :src="imageKeys[0]" alt="">
          </li>
          <li v-if="lengthFlag" @click="changeMiniCurrent(1, length + 1)" class="miniPic">
            <img :src="imageKeys[1]" alt="">
          </li>
          <li v-if="lengthFlag" @click="changeMiniCurrent(1, length + 2)" class="miniPic">
            <img :src="imageKeys[2]" alt="">
          </li>
        </ul>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action_list">
      <ul>
        <li @click="controlImage('in')">
          <i class="el-icon-zoom-in"></i>
        </li>
        <li @click="controlImage('out')">
          <i class="el-icon-zoom-out"></i>
        </li>
        <li @click="controlImage('screen')">
          <i v-if="!styleObj.fullScreen" class="el-icon-full-screen"></i>
          <i v-else class="el-icon-c-scale-to-original"></i>
        </li>
        <li @click="controlImage('right')">
          <i class="el-icon-refresh-right"></i>
        </li>
        <li @click="controlImage('left')">
          <i class="el-icon-refresh-left"></i>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImagePreviewer',
  props: {
    // 接收的图片， 标题， 当前索引号 参数
    imgPreviewConfig: {
      type: Object,
      default: {}
    },
    baseUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      title: '', // 当前标题
      url: '', // 当前图片链接
      imageKeys: [], // 图片数组
      // miniImages: [], // 缩略图数组
      imageContent: [], // 标题数组
      length: 0, // 图片总计
      lengthFlag: false, // 图片超过三张给出无缝轮播效果
      currentIndex: undefined, // 当前图片索引号
      miniImageCurrent: undefined, // 当前缩略图索引号
      shufflingLeft: 0, // 缩略图轮播位移left属性
      shufflingFlag: true, // 缩略图动画节流阀
      moveFlag: false, // 调用缓动动画的限制判断
      imgTransform: 'rotate(0deg) scale(1)', // 传给图片的transform属性
      styleObj: { // 控制图片样式的计数
        rotate: 0,
        scale: 1,
        left: 0,
        top: 0,
        fullScreen: false
      },
      hideStyleChange: true,
      num: 0,
      timer: null // 存储延时器
    }
  },
  computed: {
    miniPicBoxWidth() {
      // return ((this.length - 1) * 2 + 1) * 75 + 5 + 'px'
      return 5 * 75 + 3 + 'px'
    }
  },
  watch: {
    // 监听当前索引号，切换图片标题 重置样式对象
    currentIndex(val) {
      this.title = this.imageContent[val]
      this.hideStyleChange = false
      // 去除显示样式恢复 的过渡效果
      setTimeout(() => {
        this.imgTransform = 'rotate(0deg) scale(1)'
        this.styleObj.rotate = 0
        this.styleObj.scale = 1
        this.styleObj.fullScreen = false
        this.hideStyleChange = true
        this.url = this.imageKeys[val]
      })
    },
    lengthFlag(val) {
      if (val) this.num = -3
      else this.num = 0
    },
    // 监听缩略图当前索引号
    miniImageCurrent(val) {
      const num = this.num

      switch (val) {
        // 当前为末尾无缝展示的第一张图片
        case num - this.length:
          this.miniImageCurrent = num
          break
        // 当前为末尾无缝展示的第二张图片
        case num - this.length - 1:
          this.miniImageCurrent = num - 1
          break
        // 当前为头部无缝展示的第一张图片
        case num + 1:
          this.miniImageCurrent = num - (this.length - 1)
          break
        // 当前为头部无缝展示的第二张图片
        case num + 2:
          this.miniImageCurrent = num - (this.length - 2)
          break
      }
      this.checkMoveFlag(val)
    },
    // 监听样式对象的全屏布尔值 刷新图片样式
    'styleObj.fullScreen'(val) {
      if (val) {
        this.styleObj.scale = 1.6
      } else {
        this.styleObj.scale = 1
      }
      this.imgTransform = `rotate(${this.styleObj.rotate}deg) scale(${this.styleObj.scale})`
    }
  },
  created() {
    this.pageInit()
  },
  mounted() {
    window.addEventListener('keyup', this.previewKeyUp)
    window.addEventListener('mousewheel', this.scrollFunc)
  },
  beforeDestroy() {
    window.removeEventListener('keyup', this.previewKeyUp)
    window.removeEventListener('mousewheel', this.scrollFunc)
  },
  methods: {
    // 预览初始化
    pageInit() {
      if (this.imgPreviewConfig !== {}) {
        // 判断是否传入图片链接参数
        if (this.imgPreviewConfig.imageKeys !== undefined) {
          this.imgPreviewConfig.imageKeys.forEach(item => {
            const url = this.baseUrl + item
            this.imageKeys.push(url)
          })
          this.length = this.imgPreviewConfig.imageKeys.length
          if (this.length > 3) this.lengthFlag = true
          else this.lengthFlag = false
        } else {
          this.$message.error('请按配置传入图片数组！')
        }

        // 判断是否传入图片标题参数
        if (this.imgPreviewConfig.imageContent === undefined) {
          this.imgPreviewConfig.imageContent = []
        }
        this.imageContent = this.imgPreviewConfig.imageContent

        // 判断是否传入当前索引号
        if (this.imgPreviewConfig.currentIndex === undefined) {
          this.imgPreviewConfig.currentIndex = 0
        }
        this.currentIndex = this.imgPreviewConfig.currentIndex

        // 防止预览打开时的缓动效果
        // if (this.currentIndex !== 0) this.moveFlag = true

        // 设置缩略图当前索引
        if (this.lengthFlag) {
          this.miniImageCurrent = -3 - this.currentIndex
        } else {
          this.miniImageCurrent = 0 - this.currentIndex
        }
      }
    },
    // 键盘Esc退出预览
    previewKeyUp(e) {
      if (e.keyCode === 27) {
        this.$emit('closePreview', false)
      } else if (e.keyCode === 37) {
        // 上一个
        this.previewClick('prev')
      } else if (e.keyCode === 39) {
        // 下一个
        this.previewClick('next')
      }
    },
    // 鼠标滚轮事件
    scrollFunc(e) {
      e = e || window.event
      if (e.wheelDelta) { // 判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) { // 当滑轮向上滚动时
          this.styleObj.scale += 0.02
        }
        if (e.wheelDelta < 0) { // 当滑轮向下滚动时
          this.styleObj.scale -= 0.02
        }
      } else if (e.detail) { // Firefox滑轮事件
        if (e.detail > 0) { // 当滑轮向下滚动时
          this.styleObj.scale += 0.02
        }
        if (e.detail < 0) { // 当滑轮向上滚动时
          this.styleObj.scale -= 0.02
        }
      }
      this.imgTransform = `rotate(${this.styleObj.rotate}deg) scale(${this.styleObj.scale})`
    },
    // 点击切换图片
    previewClick(keyWord) {
      if (this.shufflingFlag) {
        this.shufflingFlag = false
        if (keyWord === 'prev') {
          // 上一个
          this.currentIndex--
          this.miniImageCurrent++
          if (this.currentIndex < 0) {
            this.currentIndex = this.length - 1
          }
        } else if (keyWord === 'next') {
          // 下一个
          this.currentIndex++
          this.miniImageCurrent--
          if (this.currentIndex > this.length - 1) {
            this.currentIndex = 0
          }
        }
      }
    },
    // 操作图片样式
    controlImage(keyWord) {
      switch (keyWord) {
        case 'in':
          this.styleObj.scale += 0.2
          break
        case 'out':
          this.styleObj.scale -= 0.2
          break
        case 'screen':
          this.styleObj.fullScreen = !this.styleObj.fullScreen
          break
        case 'right':
          this.styleObj.rotate += 90
          break
        case 'left':
          this.styleObj.rotate -= 90
          break
      }
      this.imgTransform = `rotate(${this.styleObj.rotate}deg) scale(${this.styleObj.scale})`
    },
    // 缩略图点击切换当前索引号
    changeMiniCurrent(index, miniIndex) {
      if (this.shufflingFlag) {
        this.currentIndex = index
        if (miniIndex !== undefined) {
          this.miniImageCurrent = this.num - miniIndex
        } else {
          this.miniImageCurrent = this.num - index
        }
      }
    },
    // 调用缓动动画的限制判断
    checkMoveFlag(val) {
      const distance = val
      if (this.moveFlag) {
        this.slowlyMove(distance)
      } else {
        this.moveFlag = true
        this.shufflingLeft = distance * 75 + 'px'
      }
    },
    // 缩略图move动画函数
    slowlyMove(distance) {
      const num = this.num
      const target = distance * 75
      // 多图无缝轮播
      if (distance <= num - this.length && this.lengthFlag) {
        this.shufflingLeft = (num + 1) * 75 + 'px'
      } else if (distance >= num + 1 && this.lengthFlag) {
        this.shufflingLeft = (num - this.length) * 75 + 'px'
      } else {
        clearInterval(this.timer)
        let pointLocal = parseInt(this.shufflingLeft)
        this.timer = setInterval(() => {
          let step = (target - pointLocal) / 10
          step = step > 0 ? Math.ceil(step) : Math.floor(step)
          if (Math.abs(pointLocal - target) > Math.abs(step)) {
            pointLocal += step
            this.shufflingLeft = pointLocal + 'px'
          } else {
            this.shufflingLeft = target + 'px'
            clearInterval(this.timer)
            this.timer = null

            if (!this.shufflingFlag) {
              setTimeout(() => {
                this.shufflingFlag = true
              })
            }
          }
        }, 10)
      }
    },
    // 关闭预览
    closePreview() {
      this.$emit('closePreview', false)
    }
  }
}
</script>

<style lang='less' scoped>
* {
  padding: 0;
  margin: 0;
}
li {
  list-style: none;
}
.black_container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0,0,0,.45);
  .esc_preview {
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    border-radius: 0 0 0 100px;
    line-height: 85px;
    text-align: center;
    z-index: 200;
    span {
      font-size: 36px;
      color: #f7f7f7;
      padding-left: 20px;
      cursor: pointer;
    }
  }
  .image_title {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    height: 40px;
    line-height: 40px;
    z-index: 2200;
    font-size: 20px;
    background-color: rgba(96,98,102,.6);
    padding: 0 25px;
    color: #fff;
    border-radius: 22px;
  }
  .preview_img {
    position: relative;
    height: 600px;
    margin-top: 130px;
    display: flex;
    justify-content: center;
    align-items: center;
    // background-color: pink;
    .btn_prev,
    .btn_next {
      display: none;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: rgba(96,98,102,.6);
      color: #fff;
      font-size: 30px;
      line-height: 50px;
      text-align: center;
      cursor: pointer;
      z-index: 200;
    }
    .btn_prev {
      left: 40px;
    }
    .btn_next {
      right: 40px;
    }
    .current_image {
      max-height: 600px;
      transition: all .2s ease;
    }
    &:hover {
      .btn_prev,
      .btn_next {
        display: block;
      }
    }
  }
  .miniPicBox {
    position: absolute;
    bottom: 90px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    padding: 5px 2.5px;
    background-color: rgba(96,98,102,1);
    border-radius: 3px;
    overflow: hidden;
    z-index: 200;
    .miniPic {
      height: 60px;
      width: 70px;
      margin: 0 2.5px;
      cursor: pointer;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .currentImage {
      width: 70px;
      height: 70px;
    }
    .hide_parentBox {
      position: relative;
      height: 70px;
      width: 75px;
      .shufflingBox {
        position: absolute;
        display: flex;
        align-items: center;
        top: 0;
      }
    }
  }
  .action_list {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    height: 40px;
    background-color: rgba(96,98,102,.6);
    border-radius: 25px;
    z-index: 200;
    ul {
      display: flex;
      align-items: center;
      height: 40px;
      li {
        margin: 0 30px;
        font-size: 26px;
        color: #fff;
        cursor: pointer;
      }
    }
  }
}
</style>