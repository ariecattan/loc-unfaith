import Vue from 'vue'
import App from './App.vue'
// import vuetify from '@/plugins/vuetify'
import wrap from '@vue/web-component-wrapper';



Vue.config.productionTip = false



new Vue({
  // vuetify,
  render: h => h(App)
}).$mount('#app')


const WrappedElement = wrap(Vue, App);
window.customElements.define('loc-unfaith', WrappedElement);