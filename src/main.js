import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { MotionPlugin } from '@vueuse/motion'
import { initDarkClass } from './stores/ui'

initDarkClass()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(MotionPlugin)
app.mount('#app')
