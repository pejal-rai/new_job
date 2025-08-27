<!-- pages/admin/index.vue -->
<template>
  <div class="container mx-auto px-6 py-12">
    <!-- Stats Section -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow border border-red-200">
        <p class="text-yellow-500 text-sm">Total Users</p>
        <p class="text-2xl font-bold">
          {{ stats.totalUsers || 0 }} <span class="text-yellow-500">▲</span>
        </p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow border border-red-200">
        <p class="text-yellow-500 text-sm">Total Employers</p>
        <p class="text-2xl font-bold">
          {{ stats.totalEmployers || 0 }} <span class="text-yellow-500">▲</span>
        </p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow border border-red-200">
        <p class="text-yellow-500 text-sm">Total Jobs</p>
        <p class="text-2xl font-bold">
          {{ stats.totalJobs || 0 }} <span class="text-yellow-500">▲</span>
        </p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow border border-red-200">
        <p class="text-yellow-500 text-sm">Pending Companies</p>
        <p class="text-2xl font-bold">
          {{ pendingCompanies.length || 0 }}
          <span class="text-yellow-500">▲</span>
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <NuxtLink
        to="/admin/pending-companies"
        class="bg-white p-4 rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 border border-red-200"
      >
        <i class="fas fa-building text-2xl mr-2 text-yellow-500"></i>
        <span>Manage Pending Companies</span>
      </NuxtLink>
    </div>

    <!-- Users Table -->
    <div class="bg-white p-6 rounded-lg shadow border border-red-200">
      <h2 class="text-xl font-semibold mb-4">Users and Employers</h2>
      <div v-if="loading" class="text-center">Loading...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ user.role }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="user.role"
                  @change="updateRole(user.id, $event.target.value)"
                  class="border rounded px-2 py-1"
                  :disabled="updatingRole === user.id"
                >
                  <option value="user">User</option>
                  <option value="employer">Employer</option>
                </select>
                <span v-if="updatingRole === user.id" class="ml-2 text-yellow-500"
                  >Updating...</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";
import Swal from "sweetalert2";

const config = useRuntimeConfig();
const userStore = useUserStore();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const stats = reactive({
  totalUsers: 0,
  totalEmployers: 0,
  totalJobs: 0,
});
const pendingCompanies = ref([]);
const users = ref([]);
const updatingRole = ref(null); // Track which user is being updated

definePageMeta({
  layout: "admin",
});

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    const [usersRes, worksRes, companiesRes, allUsersRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/auth/stats/users`, {
        credentials: "include",
      }),
      $fetch(`${config.public.apiBase}/works`, { credentials: "include" }),
      $fetch(`${config.public.apiBase}/companies`, { credentials: "include" }),
      $fetch(`${config.public.apiBase}/auth/users`, {
        credentials: "include",
      }), // New endpoint to fetch all users
    ]);

    if (usersRes.success) stats.totalUsers = usersRes.total || 0;
    if (worksRes.success) stats.totalJobs = worksRes.works.length || 0;
    if (companiesRes.success) {
      const allCompanies = companiesRes.company || [];
      stats.totalEmployers = allCompanies.filter((c) => c.status === "approved").length;
      pendingCompanies.value = allCompanies.filter((c) => c.status === "pending");
    }
    if (allUsersRes.success) {
      users.value = allUsersRes.users || [];
      stats.totalEmployers = users.value.filter((u) => u.role === "employer").length;
    }
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to load dashboard data";
  } finally {
    loading.value = false;
  }
};

// Update user role
const updateRole = async (userId, newRole) => {
  updatingRole.value = userId;
  try {
    const response = await $fetch(`${config.public.apiBase}/auth/update-role`, {
      method: "PUT",
      credentials: "include",
      body: { userId, newRole },
    });

    if (response.success) {
      // Update local users list
      const user = users.value.find((u) => u.id === userId);
      if (user) user.role = newRole;
      // Update stats
      stats.totalEmployers = users.value.filter((u) => u.role === "employer").length;
      await Swal.fire({
        title: "Success",
        text: response.message,
        icon: "success",
        timer: 1500,
      });
    } else {
      throw new Error(response.message);
    }
  } catch (err) {
    await Swal.fire({
      title: "Error",
      text: err.message || "Failed to update role",
      icon: "error",
    });
  } finally {
    updatingRole.value = null;
  }
};

onMounted(async () => {
  await userStore.fetchUser();
  if (userStore.user?.role !== "admin") {
    router.push("/");
    return;
  }
  await fetchDashboardData();
});
</script>
