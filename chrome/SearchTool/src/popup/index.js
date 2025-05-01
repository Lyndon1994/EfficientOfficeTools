import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./components/App.vue";
import axios from "axios";

const app = createApp(App);
app.use(ElementPlus);
app.config.globalProperties.$axios = axios;
app.mount("#app");
