<template>
  <div class="container mx-auto px-6 py-12">
    <h2 class="text-2xl font-semibold text-gray-700 mb-4">
      Pending Company Applications
    </h2>

    <div v-if="loading" class="text-center text-gray-600">
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="pendingCompanies.length === 0" class="text-center text-gray-500">
      No pending company applications.
    </div>
    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="company in pendingCompanies"
        :key="company.id"
        class="bg-white p-4 rounded-lg shadow border border-red-200"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-2">
            <p class="text-yellow-500 text-sm">Company Details</p>
            <p><strong>Name:</strong> {{ company.company_name }}</p>
            <p><strong>Address:</strong> {{ company.address }}</p>
            <p><strong>PAN No:</strong> {{ company.pan_no }}</p>
            <p><strong>Status:</strong> {{ company.status }}</p>
            <div v-if="company.logo" class="my-2">
              <img
                :src="`http://localhost:5000${company.logo}`"
                alt="Company Logo"
                class="h-24 w-24 object-contain rounded border"
              />
            </div>
          </div>
          <div class="mt-4 sm:mt-0 flex space-x-4">
            <button
              @click="approveCompany(company.id, 'approved')"
              class="bg-white p-2 rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 border border-red-200"
            >
              <i class="fas fa-check text-green-500 text-xl mr-2"></i>
              <span>Approve</span>
            </button>
            <button
              @click="approveCompany(company.id, 'rejected')"
              class="bg-white p-2 rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-gray-100 border border-red-200"
            >
              <i class="fas fa-times text-red-500 text-xl mr-2"></i>
              <span>Reject</span>
            </button>
          </div>
        </div>
      </div>
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
const pendingCompanies = ref([]);

definePageMeta({
  layout: "admin",
  title: "Pending Company Applications",
});

const fetchPendingCompanies = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/companies`, {
      method: "GET",
      credentials: "include",
    });

    console.log("Fetch response:", response);
    if (response.success) {
      pendingCompanies.value = (response.company || []).filter(
        (c) => c.status === "pending"
      );
    } else {
      error.value = response.message || "Failed to load pending companies";
    }
  } catch (err) {
    error.value = err.data?.message || err.message || "Failed to load pending companies";
  } finally {
    loading.value = false;
  }
};

const approveCompany = async (companyId, status, retries = 2) => {
  try {
    console.log("Approving company:", { companyId, status });
    const response = await $fetch(`${config.public.apiBase}/companies/approve`, {
      method: "POST",
      body: { companyId, status },
      credentials: "include",
      timeout: 10000,
    });
    console.log("Response:", response);

    if (response.success) {
      alert(`Company ${status} successfully`);
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error("Approve company error:", error);
    if (retries > 0 && error.message.includes("Failed to fetch")) {
      console.warn(`Retrying approveCompany (${retries} retries left)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return approveCompany(companyId, status, retries - 1);
    }
    if (error.status === 404) {
      alert("Company not found. It may have already been processed.");
    } else {
      alert("Error: " + (error.message || "Failed to connect to server"));
    }
  } finally {
    await fetchPendingCompanies();
  }
};

onMounted(async () => {
  await userStore.fetchUser();
  if (userStore.user?.role !== "admin") {
    router.push("/");
    return;
  }
  await fetchPendingCompanies();
});
</script>
