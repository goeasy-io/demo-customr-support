import Vue from 'vue'
import VueRouter from 'vue-router'
const Home = () => import('@/views/Home')
const Login = () => import('@/views/Login')
const Contact = () => import('@/views/Contact')
const Chat = () => import('@/views/Chat')
const Conversation = () => import('@/views/Conversation')
Vue.use(VueRouter)

//解决vue-router3.0以上版本，避免对当前位置冗余导航的警告信息：NavigationDuplicated: Avoided redundant navigation to current location
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
	return originalPush.call(this, location).catch((err) => err);
};

const routes = [
  {
    path: '/',
    component: Home,
    redirect: '/conversation',
    children: [
      {
        path: 'conversation',
        components: {
          default: Conversation
        },
	    children: [{
		  path: 'chat/:id',
		  components: {
			default: Chat
		  }
        }]
      },
      {
        path: 'contact',
        components: {
          default: Contact
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
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (to.path !== '/login' && !currentUser) {
    next({path: '/login'})
  }
  else next()
})

export default router
