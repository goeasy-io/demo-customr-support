import Vue from 'vue'
import VueRouter from 'vue-router'
const Home = () => import('@/views/Home/Home')
const Login = () => import('@/views/Login/Login')
const Contact = () => import('@/views/Contact/Contact')
const Chat = () => import('@/views/Chat/Chat')
const Conversation = () => import('@/views/Conversation/Conversation')
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
    children: [
      {
        path: '',
        redirect: '/conversation'
      },
      {
        path: '/conversation',
        name: 'Conversation',
        components: {
          default: Conversation
        },
	    children: [{
		  path: '/chat/:id',
		  name: 'Chat',
		  components: {
			default: Chat
		  }
        }]
      },
      {
        path: '/contact',
        name: 'Contact',
        components: {
          default: Contact
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    components: {
      default: Login
    }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentStaff'));
  if (to.name !== 'Login' && !currentUser) {
    next({name: 'Login'})
  }
  else next()
})

export default router
