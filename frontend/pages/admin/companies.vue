<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-bold text-black mb-6">Admin: Company Approvals</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else-if="companies.length === 0" class="text-center">
      No pending companies.
    </div>
    <div v-else class="grid gap-6">
      <div
        v-for="company in companies"
        :key="company.id"
        class="bg-white shadow-md rounded-lg p-4"
      >
        <p><strong>Name:</strong> {{ company.company_name }}</p>
        <p><strong>Address:</strong> {{ company.address }}</p>
        <p><strong>PAN No:</strong> {{ company.pan_no }}</p>
        <p><strong>Status:</strong> {{ company.status }}</p>
        <div v-if="company.logo" class="my-2">
          <img
            :src="`http://localhost:5000${company.logo}`"
            alt="Logo"
            class="h-24 w-24 object-contain"
          />
        </div>
        <div class="mt-4 flex space-x-4">
          <button
            @click="approveCompany(company.id, 'approved')"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Approve
          </button>
          <button
            @click="approveCompany(company.id, 'rejected')"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

const config = useRuntimeConfig();
const userStore = useUserStore();
const companies = ref([]);
const loading = ref(true);

onMounted(async () => {
  if (userStore.user?.role !== "admin") {
    return navigateTo("/");
  }
  await fetchCompanies();
});

const fetchCompanies = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/companies`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success) {
      companies.value = response.company; // Adjust based on actual response structure
    }
  } catch (error) {
    console.error("Error fetching companies:", error);
  } finally {
    loading.value = false;
  }
};

const approveCompany = async (companyId, status) => {
  try {
    const response = await $fetch(`${config.public.apiBase}/companies/approve`, {
      method: "POST",
      body: { companyId, status },
      credentials: "include",
    });
    if (response.success) {
      alert(`Company ${status} successfully`);
      await fetchCompanies();
    } else {
      alert(response.message);
    }
  } catch (error) {
    alert("Error: " + error.message);
  }
};
</script>
