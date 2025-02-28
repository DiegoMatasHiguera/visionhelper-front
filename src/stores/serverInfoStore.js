import { defineStore } from 'pinia';

export const useServerInfoStore = defineStore("serverInfo",{
  state: () => ({
    environment: "http://127.0.0.1:80/visionhelper"
  }),
});