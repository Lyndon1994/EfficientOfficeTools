import Vue from "vue";
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from "./components/App.vue";

Vue.use(ElementUI);

new Vue({
  el: "#app",
  render: h => h(App)
});
