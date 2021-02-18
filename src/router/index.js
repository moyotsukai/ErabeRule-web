import Vue from 'vue'
import Router from 'vue-router'
import homeView from '@/components/homeView'
import attendView from '@/components/attendView'
import createView from '@/components/createView'
import roomOutlineView from '@/components/roomOutlineView'
import formView from '@/components/formView'
import newRoomView from '@/components/newRoomView'
import roomSettingView from '@/components/roomSettingView'
Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            component: homeView
        },
        {
            path: '/attend',
            component: attendView
        },
        {
            path: '/create',
            component: createView
        },
        {
            path: '/roomoutline',
            name: 'roomOutline',
            component: roomOutlineView
        },
        {
            path: '/roomoutline/form',
            name: 'form',
            component: formView
        },
        {
            path: '/newroom',
            component: newRoomView
        },
        {
            path: '/roomsetting',
            name: 'roomSetting',
            component: roomSettingView
        }
  ]
})
