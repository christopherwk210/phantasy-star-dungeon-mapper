import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/styles/cascadia-mono.css';
import './assets/styles/global.scss';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);

app.mount('#app');
