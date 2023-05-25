import Vue from "vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from "./components/App.vue";
import axios from "axios";

Vue.use(ElementUI);
Vue.prototype.$axios = axios;
new Vue({
  el: "#app",
  render: h => h(App)
});
