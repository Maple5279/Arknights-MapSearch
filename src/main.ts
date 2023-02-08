import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './assets/main.css'
import router from './router/router'
import 'amfe-flexible'
import store from './store'


createApp(App)
.use(router)
.use(store)
.use(ElementPlus)
.mount('#app')
