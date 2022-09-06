import Vue from 'vue'
import VueRouter from 'vue-router'

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
    routes
});

router.beforeEach((to, from, next) => {
    const currentAgent = JSON.parse(localStorage.getItem('currentAgent'));
    if (to.path !== '/login' && !currentAgent) {
        next({path: '/login'})
    } else next()
});

export default router
