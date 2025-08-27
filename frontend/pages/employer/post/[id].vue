<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-bold text-[#75581a] mb-6 text-center">Edit Job</h1>
    <div class="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <form @submit.prevent="editJob" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-600 font-medium">Job Title</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600 font-medium">Position</label>
            <input
              v-model="form.position"
              type="text"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600 font-medium">Salary</label>
            <input
              v-model="form.salary"
              type="number"
              step="0.01"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600 font-medium">Apply Date</label>
            <input
              v-model="form.apply_date"
              type="date"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600 font-medium">End Date</label>
            <input
              v-model="form.end_date"
              type="date"
              class="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600 font-medium">Image</label>
            <input
              type="file"
              @change="onFileChange"
              accept="image/jpeg,image/jpg,image/png,image/avif,image/webp"
              class="w-full border border-gray-300 p-2 rounded"
            />
            <img
              v-if="form.imagePreview"
              :src="form.imagePreview"
              alt="Preview"
              class="mt-2 w-32 h-32 object-cover rounded"
            />
          </div>
        </div>
        <div>
          <label class="block text-gray-600 font-medium">Requirements</label>
          <QuillEditor
            ref="requirementEditor"
            v-model:content="form.requirement"
            content-type="html"
            theme="snow"
            class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-gray-600 font-medium">Description</label>
          <QuillEditor
            ref="descriptionEditor"
            v-model:content="form.description"
            content-type="html"
            theme="snow"
            class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex space-x-4">
          <button
            type="submit"
            class="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-200"
            :disabled="isSubmitting"
          >
            Save Changes
          </button>
          <NuxtLink
            to="/employer/post"
            class="flex-1 bg-gray-500 text-white p-2 rounded text-center hover:bg-gray-600 transition duration-200"
          >
            Cancel
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "~/stores/user";

const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const requirementEditor = ref(null);
const descriptionEditor = ref(null);

const form = reactive({
  title: "",
  position: "",
  salary: "",
  requirement: "",
  description: "",
  apply_date: "",
  end_date: "",
  image: null,
  imagePreview: null,
});
const isSubmitting = ref(false);

// Base URL for static assets (without /api)
const staticBaseUrl = config.public.apiBase.replace("/api", "");

// Fetch job data on mount
onMounted(async () => {
  const success = await userStore.fetchUser();
  if (!success || !userStore.isEmployer()) {
    router.push("/");
  } else {
    await fetchJob();
  }
});

const fetchJob = async () => {
  try {
    const jobId = route.params.id;
    const response = await $fetch(`${config.public.apiBase}/works/${jobId}`, {
      method: "GET",
      credentials: "include",
    });
    if (response.success && response.work.user_id === userStore.user.id) {
      const job = response.work;
      form.title = job.title;
      form.position = job.position;
      form.salary = job.salary;
      form.requirement = job.requirement;
      form.description = job.description;
      form.apply_date = job.apply_date.split("T")[0];
      form.end_date = job.end_date.split("T")[0];
      form.imagePreview = job.image ? `${staticBaseUrl}${job.image}` : null;

      nextTick(() => {
        if (requirementEditor.value)
          requirementEditor.value.setHTML(job.requirement || "");
        if (descriptionEditor.value)
          descriptionEditor.value.setHTML(job.description || "");
      });
    } else {
      router.push("/employer/post");
    }
  } catch (error) {
    console.error("Fetch job error:", error);
    router.push("/employer");
  }
};

// Handle file change
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.image = file;
    form.imagePreview = URL.createObjectURL(file);
    console.log("Image preview URL:", form.imagePreview);
  } else {
    form.image = null;
    form.imagePreview = null;
  }
};

// Edit job
const editJob = async () => {
  isSubmitting.value = true;
  try {
    const requiredFields = [
      "title",
      "position",
      "salary",
      "requirement",
      "description",
      "apply_date",
      "end_date",
    ];
    const missing = requiredFields.filter(
      (field) => !form[field] || form[field].toString().trim() === ""
    );
    if (missing.length > 0) {
      throw new Error(`Missing or empty fields: ${missing.join(", ")}`);
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("position", form.position);
    formData.append("salary", form.salary);
    formData.append("requirement", form.requirement);
    formData.append("description", form.description);
    formData.append("apply_date", form.apply_date);
    formData.append("end_date", form.end_date);
    if (form.image) formData.append("image", form.image);

    const jobId = route.params.id;
    const response = await $fetch(`${config.public.apiBase}/works/${jobId}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (response.success) {
      alert("Job updated successfully!");
      router.push("/employer/post");
    } else {
      alert(`Failed to update job: ${response.message || "Unknown error"}`);
    }
  } catch (error) {
    const errorMessage = error.data?.message || error.message || "Unknown error";
    alert(`Error updating job: ${errorMessage}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
