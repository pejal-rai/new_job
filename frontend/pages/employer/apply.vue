<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold text-[#836132] mb-6 text-center">
      Apply to Become an Employer
    </h1>
    <div class="bg-white/75 shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <form
        @submit.prevent="companySubmitted ? submitUpdate() : applyForEmployer()"
        class="space-y-6"
      >
        <!-- Grid layout: 1 row, 2 columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-6">
            <div>
              <label class="block text-gray-600 font-medium">Company Name</label>
              <input
                v-model="form.company_name"
                type="text"
                class="w-full border border-gray-300 p-2 rounded"
                required
                :disabled="isSubmitting"
              />
            </div>
            <div>
              <label class="block text-gray-600 font-medium">Address</label>
              <textarea
                v-model="form.address"
                class="w-full border border-gray-300 p-2 rounded"
                rows="3"
                required
                :disabled="isSubmitting"
              ></textarea>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-6">
            <div>
              <label class="block text-gray-600 font-medium">PAN Number</label>
              <input
                v-model="form.pan_no"
                type="text"
                class="w-full border border-gray-300 p-2 rounded"
                required
                :disabled="isSubmitting"
              />
            </div>
            <div>
              <label class="block text-gray-600 font-medium">Logo</label>
              <input
                type="file"
                @change="onFileChange"
                accept="image/jpeg,image/jpg,image/png"
                class="w-full"
                :disabled="isSubmitting"
              />
              <img
                v-if="form.logo && typeof form.logo === 'string'"
                :src="`http://localhost:5000${form.logo}`"
                alt="Current Logo"
                class="mt-2 h-24 w-24 object-contain rounded border"
              />
            </div>
          </div>
        </div>

        <!-- Buttons (full width) -->
        <div class="space-y-4 space-x-3 text-center ">
          <button
            type="submit"
            class="w-50% bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            :disabled="isSubmitting"
          >
            {{
              isSubmitting
                ? companySubmitted
                  ? "Saving..."
                  : "Submitting..."
                : companySubmitted
                ? "Update Application"
                : "Submit Application"
            }}
          </button>

          <button
            v-if="companySubmitted"
            @click.prevent="deleteCompany"
            class="w-50% bg-red-500 text-white p-2 rounded hover:bg-red-600"
            :disabled="isSubmitting"
          >
            Delete Application
          </button>
        </div>
      </form>

      <!-- Rejection message -->
      <div v-if="rejectionMessage" class="text-red-600 mt-4">
        {{ rejectionMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";

const config = useRuntimeConfig();
const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  company_name: "",
  address: "",
  pan_no: "",
  logo: null,
});
const isSubmitting = ref(false);
const companySubmitted = ref(false);
const rejectionMessage = ref("");

// Populate form with company data
const populateForm = (company) => {
  if (company) {
    form.company_name = company.company_name || "";
    form.address = company.address || "";
    form.pan_no = company.pan_no || "";
    form.logo = company.logo || null;
    companySubmitted.value =
      company.status === "pending" || company.status === "approved";
    rejectionMessage.value =
      company.status === "rejected"
        ? "Your company application was rejected by the admin."
        : "";
  } else {
    companySubmitted.value = false;
    form.company_name = "";
    form.address = "";
    form.pan_no = "";
    form.logo = null;
    rejectionMessage.value = "";
  }
};

// Fetch and populate company data
const fetchAndPopulate = async () => {
  await userStore.fetchCompany();
  populateForm(userStore.company);
};

const onFileChange = (event) => {
  form.logo = event.target.files[0];
};

const applyForEmployer = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("company_name", form.company_name);
    formData.append("address", form.address);
    formData.append("pan_no", form.pan_no);
    if (form.logo && typeof form.logo !== "string") formData.append("logo", form.logo);

    const response = await $fetch(`${config.public.apiBase}/companies/create`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (response.success) {
      companySubmitted.value = true;
      await fetchAndPopulate();
      alert("Company application submitted successfully!");
    } else {
      alert(response.message);
    }
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};

const submitUpdate = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("company_name", form.company_name);
    formData.append("address", form.address);
    formData.append("pan_no", form.pan_no);
    if (form.logo && typeof form.logo !== "string") formData.append("logo", form.logo);

    const response = await $fetch(`${config.public.apiBase}/companies/edit`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (response.success) {
      await fetchAndPopulate();
      alert("Company updated successfully!");
    } else {
      alert(response.message);
    }
  } catch (error) {
    alert("Error: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};

const deleteCompany = async () => {
  if (confirm("Are you sure you want to delete your company application?")) {
    try {
      const response = await $fetch(`${config.public.apiBase}/companies/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.success) {
        companySubmitted.value = false;
        form.company_name = "";
        form.address = "";
        form.pan_no = "";
        form.logo = null;
        rejectionMessage.value = "";
        alert("Company deleted successfully!");
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }
};

onMounted(async () => {
  if (
    !userStore.isAuthenticated ||
    (userStore.user?.role !== "user" && userStore.user?.role !== "employer")
  ) {
    router.push("/");
    return;
  }
  await fetchAndPopulate();
});
</script>
