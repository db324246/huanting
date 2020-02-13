// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ImageUpload from '@/components/ImageUpload.vue'
import moment from 'moment';
Vue.prototype.$moment = moment;

import globalcss from '@static/global.less';
Vue.use(globalcss)

import mixin from '@/mixins'
Vue.mixin(mixin)

Vue.use(ElementUI)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App, ImageUpload },
  template: '<App/>'
})