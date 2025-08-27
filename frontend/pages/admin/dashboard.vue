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
          {{ pendingCompanies.length || 0 }} <span class="text-yellow-500">▲</span>
        </p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        to="/admin/pending-companies"
        class="bg-white p-4 rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 border border-red-200"
      >
        <i class="fas fa-building text-2xl mr-2 text-yellow-500"></i>
        <span>Manage Pending Companies</span>
      </NuxtLink>
      <!-- Add more action buttons if needed -->
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

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

definePageMeta({
  layout: "admin", // Adjust if you have a custom admin layout
});

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    const [usersRes, worksRes, companiesRes] = await Promise.all([
      $fetch(`${config.public.apiBase}/auth/stats/users`, { credentials: "include" }),
      $fetch(`${config.public.apiBase}/works`, { credentials: "include" }),
      $fetch(`${config.public.apiBase}/companies`, { credentials: "include" }),
    ]);

    if (usersRes.success) stats.totalUsers = usersRes.total || 0;
    if (worksRes.success) stats.totalJobs = worksRes.works.length || 0;
    if (companiesRes.success) {
      const allCompanies = companiesRes.company || [];
      stats.totalEmployers = allCompanies.filter((c) => c.status === "approved").length;
      pendingCompanies.value = allCompanies.filter((c) => c.status === "pending");
    }
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to load dashboard data";
  } finally {
    loading.value = false;
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
