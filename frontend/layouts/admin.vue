<!-- layouts/admin.vue -->
<template>
  <div class="h-screen">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="ml-64 p-6 bg-gray-100 overflow-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-700">
          {{ $route.meta.title || 'Admin Panel' }}
        </h1>
       
      </div>

      <!-- Page Content -->
      <slot />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '~/components/Sidebar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const pageTitle = computed(() => route.meta.title || 'Admin Panel')
</script>

<style scoped>
/* Ensure Font Awesome is included */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');
</style>