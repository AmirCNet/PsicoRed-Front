import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import 'blobatar/motion.css'
import App from './App.vue'
import { router } from './routers/index.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
