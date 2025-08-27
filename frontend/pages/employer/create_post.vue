<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-bold text-[#75581a] mb-6 text-center">Create a New Job</h1>
    <div class="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <form @submit.prevent="createJob" class="space-y-6">
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
              name="image"
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
            class="flex-1 bg-[#b78c36] text-white p-2 rounded hover:bg-[#9b772f] transition duration-200"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Creating..." : "Create Job" }}
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
import { useRouter } from "vue-router";
import { useUserStore } from "~/stores/user";

const config = useRuntimeConfig();
const router = useRouter();
const userStore = useUserStore();

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

const onFileChange = (event) => {
  const file = event.target.files[0];
  console.log("Selected file for job image:", file);
  if (file) {
    form.image = file;
    form.imagePreview = URL.createObjectURL(file);
    console.log("Image preview URL:", form.imagePreview);
  } else {
    form.image = null;
    form.imagePreview = null;
  }
};

const createJob = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("position", form.position);
    formData.append("salary", form.salary);
    formData.append("requirement", form.requirement);
    formData.append("description", form.description);
    formData.append("apply_date", form.apply_date);
    formData.append("end_date", form.end_date);
    if (form.image) formData.append("image", form.image);

    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(
        `${key}:`,
        value instanceof File ? `${value.name} (${value.size} bytes)` : value
      );
    }

    const response = await $fetch(`${config.public.apiBase}/works/create`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    console.log("Create job response:", response);

    if (response.success) {
      alert("Job created successfully!");
      router.push("/employer/post");
    } else {
      alert(`Failed to create job: ${response.message}`);
    }
  } catch (error) {
    console.error("Create job error:", error);
    alert(`Error: ${error.message || "Unknown error"}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
