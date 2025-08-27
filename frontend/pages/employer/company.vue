<template>
  <div class="mx-auto">
    <h1 class="text-4xl font-bold text-black mb-2">Manage Your Company</h1>

    <!-- Loading State -->
    <div v-if="userStore.isLoading" class="text-center text-gray-600">
      <p>Loading...</p>
    </div>

    <!-- No Company Exists or Form Submission -->
    <div
      v-else-if="!hasCompany || justSubmitted"
      class="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto"
    >
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        {{ justSubmitted ? "Company Submitted" : "Create Your Company" }}
      </h2>

      <!-- Show Form if not yet submitted -->
      <form v-if="!justSubmitted" @submit.prevent="createCompany" class="space-y-4">
        <div>
          <label class="block text-gray-600 font-medium">Company Name</label>
          <input
            v-model="form.company_name"
            type="text"
            class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label class="block text-gray-600 font-medium">Logo (Optional)</label>
          <input
            type="file"
            name="logo"
            accept="image/jpeg,image/jpg,image/png"
            @change="onFileChange"
            class="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>
        <div>
          <label class="block text-gray-600 font-medium">Address</label>
          <textarea
            v-model="form.address"
            class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          ></textarea>
        </div>
        <div>
          <label class="block text-gray-600 font-medium">PAN Number</label>
          <input
            v-model="form.pan_no"
            type="text"
            class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div v-if="errorMessage" class="text-red-500 text-center">
          {{ errorMessage }}
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Submitting..." : "Submit for Approval" }}
        </button>
      </form>

      <!-- Show Submitted Data if just submitted -->
      <div v-else class="space-y-4">
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">Logo:</span>
          <img
            v-if="form.logo"
            :src="URL.createObjectURL(form.logo)"
            alt="Company Logo"
            class="h-24 w-24 object-contain rounded border border-gray-200"
          />
          <span v-else class="text-gray-500 italic">No logo uploaded</span>
        </div>
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">Name:</span>
          <span class="text-gray-800">{{ form.company_name }}</span>
        </div>
        <div class="flex items-start">
          <span class="w-32 font-medium text-gray-600">Address:</span>
          <span class="text-gray-800">{{ form.address }}</span>
        </div>
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">PAN Number:</span>
          <span class="text-gray-800">{{ form.pan_no }}</span>
        </div>
        <button
          class="w-full bg-yellow-500 text-white p-2 rounded cursor-not-allowed"
          disabled
        >
          Pending
        </button>
      </div>
    </div>

    <!-- Pending Approval -->
    <div
      v-else-if="userStore.company.status === 'pending' && !justSubmitted"
      class="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto"
    >
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Your Company</h2>
      <div class="space-y-4">
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">Logo:</span>
          <img
            v-if="userStore.company.logo"
            :src="`http://localhost:5000${userStore.company.logo}`"
            alt="Company Logo"
            class="h-24 w-24 object-contain rounded border border-gray-200"
          />
          <span v-else class="text-gray-500 italic">No logo uploaded</span>
        </div>
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">Name:</span>
          <span class="text-gray-800">{{ userStore.company.company_name }}</span>
        </div>
        <div class="flex items-start">
          <span class="w-32 font-medium text-gray-600">Address:</span>
          <span class="text-gray-800">{{ userStore.company.address }}</span>
        </div>
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">PAN Number:</span>
          <span class="text-gray-800">{{ userStore.company.pan_no }}</span>
        </div>
        <button
          class="w-full bg-yellow-500 text-white p-2 rounded cursor-not-allowed"
          disabled
        >
          Pending
        </button>
      </div>
    </div>

    <!-- Rejected -->
    <div
      v-else-if="userStore.company.status === 'rejected'"
      class="text-center text-red-600"
    >
      <p>Your company application was rejected. Please contact support or reapply.</p>
      <NuxtLink to="/employer/apply" class="text-blue-500 underline">Reapply</NuxtLink>
    </div>

    <!-- Approved Company Details -->
    <div
      v-else-if="!isEditing"
      class="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto"
    >
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Your Company</h2>
      <div class="space-y-4">
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">Logo:</span>
          <img
            v-if="userStore.company.logo"
            :src="`http://localhost:5000${userStore.company.logo}`"
            alt="Company Logo"
            class="h-24 w-24 object-contain rounded border border-gray-200"
          />
          <span v-else class="text-gray-500 italic">No logo uploaded</span>
        </div>
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">Name:</span>
          <span class="text-gray-800">{{ userStore.company.company_name }}</span>
        </div>
        <div class="flex items-start">
          <span class="w-32 font-medium text-gray-600">Address:</span>
          <span class="text-gray-800">{{ userStore.company.address }}</span>
        </div>
        <div class="flex items-center">
          <span class="w-32 font-medium text-gray-600">PAN Number:</span>
          <span class="text-gray-800">{{ userStore.company.pan_no }}</span>
        </div>
      </div>
      <div class="mt-6 flex space-x-4">
        <button
          @click="startEditing"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
        >
          Edit Company
        </button>
        <button
          @click="deleteCompany"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
        >
          Delete Company
        </button>
      </div>
    </div>

    <!-- Edit Form (Approved Companies Only) -->
    <div v-else class="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Edit Your Company</h2>
      <form @submit.prevent="editCompany" class="space-y-4">
        <div>
          <label class="block text-gray-600 font-medium">Company Name</label>
          <input
            v-model="form.company_name"
            type="text"
            class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label class="block text-gray-600 font-medium">Logo</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            @change="onFileChange"
            class="w-full text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
          <p v-if="userStore.company.logo" class="text-sm text-gray-500 mt-1">
            Current logo:
            <img
              :src="`http://localhost:5000${userStore.company.logo}`"
              alt="Current Logo"
              class="inline h-12 w-12 object-contain"
            />
          </p>
        </div>
        <div>
          <label class="block text-gray-600 font-medium">Address</label>
          <textarea
            v-model="form.address"
            class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          ></textarea>
        </div>
        <div>
          <label class="block text-gray-600 font-medium">PAN Number</label>
          <input
            v-model="form.pan_no"
            type="text"
            class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div v-if="errorMessage" class="text-red-500 text-center">
          {{ errorMessage }}
        </div>
        <div class="flex space-x-4">
          <button
            type="submit"
            class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200"
          >
            Save Changes
          </button>
          <button
            type="button"
            @click="cancelEditing"
            class="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
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
  logo: null,
  address: "",
  pan_no: "",
});

const hasCompany = computed(() => !!userStore.company);
const isEditing = ref(false);
const isSubmitting = ref(false);
const justSubmitted = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  await userStore.fetchUser();
  if (userStore.company) {
    form.company_name = userStore.company.company_name;
    form.address = userStore.company.address;
    form.pan_no = userStore.company.pan_no || "";
  }
});

const onFileChange = (event) => {
  const file = event.target.files[0];
  console.log("Selected file for company logo:", file);
  if (
    file &&
    file.type.startsWith("image/") &&
    ["image/jpeg", "image/jpg", "image/png"].includes(file.type)
  ) {
    form.logo = file;
    errorMessage.value = "";
  } else {
    form.logo = null;
    errorMessage.value = file
      ? "Please select a valid image file (jpeg, jpg, png)"
      : "No file selected";
    event.target.value = "";
  }
};

const createCompany = async () => {
  isSubmitting.value = true;
  errorMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("company_name", form.company_name);
    formData.append("address", form.address);
    formData.append("pan_no", form.pan_no);
    if (form.logo instanceof File) {
      formData.append("logo", form.logo);
    }

    console.log("Submitting FormData:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value);
    }

    const response = await $fetch(`${config.public.apiBase}/companies/create`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (response.success) {
      userStore.company = {
        company_name: form.company_name,
        logo: form.logo ? URL.createObjectURL(form.logo) : null,
        address: form.address,
        pan_no: form.pan_no,
        status: "pending",
      };
      justSubmitted.value = true;
      alert("Company creation request submitted. Awaiting admin approval.");
    } else {
      errorMessage.value = response.message || "Failed to create company";
      alert(errorMessage.value);
    }
  } catch (error) {
    console.error("Create company error:", error);
    errorMessage.value =
      error.data?.message || error.message || "Failed to create company";
    alert(errorMessage.value);
  } finally {
    isSubmitting.value = false;
  }
};

const startEditing = () => {
  if (userStore.company.status === "approved") {
    isEditing.value = true;
  } else {
    errorMessage.value = "You can only edit your company after it has been approved.";
    alert(errorMessage.value);
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  form.company_name = userStore.company.company_name;
  form.address = userStore.company.address;
  form.pan_no = userStore.company.pan_no || "";
  form.logo = null;
  errorMessage.value = "";
};

const editCompany = async () => {
  errorMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("company_name", form.company_name);
    formData.append("address", form.address);
    formData.append("pan_no", form.pan_no);
    if (form.logo instanceof File) {
      formData.append("logo", form.logo);
    }

    console.log("Editing FormData:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value);
    }

    const response = await $fetch(`${config.public.apiBase}/companies/edit`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (response.success) {
      await userStore.fetchCompany();
      alert("Company updated successfully!");
      isEditing.value = false;
      form.logo = null;
    } else {
      errorMessage.value = response.message || "Failed to edit company";
      alert(errorMessage.value);
    }
  } catch (error) {
    console.error("Edit company error:", error);
    errorMessage.value = error.data?.message || error.message || "Failed to edit company";
    alert(errorMessage.value);
  }
};

const deleteCompany = async () => {
  if (userStore.company.status !== "approved") {
    errorMessage.value = "You can only delete your company after it has been approved.";
    alert(errorMessage.value);
    return;
  }
  if (confirm("Are you sure you want to delete your company?")) {
    try {
      const response = await $fetch(`${config.public.apiBase}/companies/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.success) {
        userStore.company = null;
        form.company_name = "";
        form.logo = null;
        form.address = "";
        form.pan_no = "";
        justSubmitted.value = false;
        alert("Company deleted successfully!");
      } else {
        errorMessage.value = response.message || "Failed to delete company";
        alert(errorMessage.value);
      }
    } catch (error) {
      console.error("Delete company error:", error);
      errorMessage.value =
        error.data?.message || error.message || "Failed to delete company";
      alert(errorMessage.value);
    }
  }
};
</script>
