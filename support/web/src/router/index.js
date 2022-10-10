import Vue from 'vue'
import VueRouter from 'vue-router'
import {publicPath} from "../../vue.config";

const Home = () => import('@/views/Home');
const Login = () => import('@/views/Login');
const Customers = () => import('@/views/Customers');
const Chat = () => import('@/views/Chat');
const Conversations = () => import('@/views/Conversations');
Vue.use(VueRouter);

//解决vue-router3.0以上版本，避免对当前位置冗余导航的警告信息：NavigationDuplicated: Avoided redundant navigation to current location
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

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
                    path: 'chat',
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
