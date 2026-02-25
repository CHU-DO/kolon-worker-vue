import { createRouter, createWebHistory } from "vue-router";
import Viewer from "../views/ContentViewer.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Viewer",
      component: Viewer,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/itemlist",
      name: "itemlist",
      component: () => import("../views/ItemList.vue"),
    },
  ],
});

export default router;
