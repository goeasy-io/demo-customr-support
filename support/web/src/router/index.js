import Vue from 'vue'
import VueRouter from 'vue-router'
import {publicPath} from "../../vue.config";

const Home = () => import('@/views/Home');
const Login = () => import('@/views/Login');
const Customers = () => import('@/views/Customers');
const Chat = () => import('@/views/Chat');
const Conversations = () => import('@/views/Conversations');
Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        component: Home,
        redirect: '/conversations',
        children: [
            {
                path: 'conversations',
                components: {
                    default: Conversations
                },
                children: [{
                    path: 'chat/:id',
                    components: {
                        default: Chat
                    }
                }]
            },
            {
                path: 'customers',
                components: {
                    default: Customers
                }
            }
        ]
    },
    {
        path: '/login',
        components: {
            default: Login
        }
    }
];

const router = new VueRouter({
    mode: 'history',
    base: publicPath+'/',
    routes
});

router.beforeEach((to, from, next) => {
    if (to.path !== '/login' && !Vue.prototype.globalData.currentAgent) {
        next({path: '/login'})
    } else next()
});

export default router
