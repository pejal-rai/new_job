<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Manage Your CV</h1>

    <div v-if="userStore.isLoading" class="text-center text-gray-500">Loading...</div>
    <div v-else-if="!userStore.isAuthenticated" class="text-center text-red-500">
      Please log in to manage your CV.
    </div>
    <div v-else class="bg-white/75 p-7">
      <div v-if="!userStore.hasCV">
        <h2 class="text-2xl mb-4 font-semibold">Create Your CV</h2>
        <form @submit.prevent="createCV" class="space-y-4">
          <div>
            <label class="block text-gray-600">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600">Phone</label>
            <input v-model="form.phone" type="text" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block text-gray-600">Photo</label>
            <input
              type="file"
              @change="onFileChange"
              accept="image/jpeg,image/jpg,image/png"
              class="w-full border border-gray-300 p-2 rounded"
            />
            <img
              v-if="form.photoPreview"
              :src="form.photoPreview"
              alt="Preview"
              class="mt-2 w-32 h-32 object-cover rounded"
            />
          </div>
          <div>
            <label class="block text-gray-600">Education</label>
            <ClientOnly>
              <QuillEditor
                ref="educationEditor"
                v-model:content="form.education"
                content-type="html"
                theme="snow"
                class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <template #fallback>
                <textarea
                  v-model="form.education"
                  class="w-full border p-2 rounded"
                  placeholder="Enter your education details..."
                ></textarea>
              </template>
            </ClientOnly>
          </div>
          <div>
            <label class="block text-gray-600">Experience</label>
            <ClientOnly>
              <QuillEditor
                ref="experienceEditor"
                v-model:content="form.experience"
                content-type="html"
                theme="snow"
                class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <template #fallback>
                <textarea
                  v-model="form.experience"
                  class="w-full border p-2 rounded"
                  placeholder="Enter your experience details..."
                ></textarea>
              </template>
            </ClientOnly>
          </div>
          <div>
            <label class="block text-gray-600">Skills</label>
            <ClientOnly>
              <QuillEditor
                ref="skillsEditor"
                v-model:content="form.skills"
                content-type="html"
                theme="snow"
                class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <template #fallback>
                <textarea
                  v-model="form.skills"
                  class="w-full border p-2 rounded"
                  placeholder="Enter your skills..."
                ></textarea>
              </template>
            </ClientOnly>
          </div>
          <button
            type="submit"
            class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            :disabled="isSubmitting"
          >
            Create CV
          </button>
        </form>
      </div>
      <div v-else>
        <h2 class="text-2xl mb-4">Your CV</h2>
        <form @submit.prevent="updateCV" class="space-y-4">
          <div>
            <label class="block text-gray-600">Name</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label class="block text-gray-600">Phone</label>
            <input v-model="form.phone" type="text" class="w-full border p-2 rounded" />
          </div>
          <div>
            <label class="block text-gray-600">Photo</label>
            <input
              type="file"
              @change="onFileChange"
              accept="image/jpeg,image/jpg,image/png"
              class="w-full border border-gray-300 p-2 rounded"
            />
            <img
              v-if="form.photoPreview"
              :src="form.photoPreview"
              alt="Preview"
              class="mt-2 w-32 h-32 object-cover rounded"
            />
          </div>
          <div>
            <label class="block text-gray-600">Education</label>
            <ClientOnly>
              <QuillEditor
                ref="educationEditor"
                v-model:content="form.education"
                content-type="html"
                theme="snow"
                class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <template #fallback>
                <textarea
                  v-model="form.education"
                  class="w-full border p-2 rounded"
                  placeholder="Enter your education details..."
                ></textarea>
              </template>
            </ClientOnly>
          </div>
          <div>
            <label class="block text-gray-600">Experience</label>
            <ClientOnly>
              <QuillEditor
                ref="experienceEditor"
                v-model:content="form.experience"
                content-type="html"
                theme="snow"
                class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <template #fallback>
                <textarea
                  v-model="form.experience"
                  class="w-full border p-2 rounded"
                  placeholder="Enter your experience details..."
                ></textarea>
              </template>
            </ClientOnly>
          </div>
          <div>
            <label class="block text-gray-600">Skills</label>
            <ClientOnly>
              <QuillEditor
                ref="skillsEditor"
                v-model:content="form.skills"
                content-type="html"
                theme="snow"
                class="border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <template #fallback>
                <textarea
                  v-model="form.skills"
                  class="w-full border p-2 rounded"
                  placeholder="Enter your skills..."
                ></textarea>
              </template>
            </ClientOnly>
          </div>
          <div class="flex gap-4">
            <button
              type="submit"
              class="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              :disabled="isSubmitting"
            >
              Update CV
            </button>
            <button
              type="button"
              @click="deleteCV"
              class="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              :disabled="isSubmitting"
            >
              Delete CV
            </button>
          
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const isSubmitting = ref(false);

const form = reactive({
  name: "",
  email: "",
  phone: "",
  education: "",
  experience: "",
  skills: "",
  photo: null,
  photoPreview: null,
});


onMounted(async () => {
  await userStore.fetchUser();
  if (userStore.hasCV) {
    form.name = userStore.cv.name;
    form.email = userStore.cv.email;
    form.phone = userStore.cv.phone || "";
    form.education = userStore.cv.education || "";
    form.experience = userStore.cv.experience || "";
    form.skills = userStore.cv.skills || "";
    form.photoPreview = userStore.cv.photo_path
      ? `${useRuntimeConfig().public.apiBase.replace("/api", "")}${
          userStore.cv.photo_path
        }`
      : null;
  } else {
    form.name = userStore.user?.name || "";
    form.email = userStore.user?.email || "";
  }
});

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.photo = file;
    form.photoPreview = URL.createObjectURL(file);
  } else {
    form.photo = null;
    form.photoPreview = null;
  }
};

const createCV = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("education", form.education);
    formData.append("experience", form.experience);
    formData.append("skills", form.skills);
    if (form.photo) formData.append("photo", form.photo);

    const pdfPath = await userStore.createCV(formData);
    if (pdfPath) {
      await userStore.fetchUser();
      alert("CV created successfully!");
      window.location.href = `${useRuntimeConfig().public.apiBase.replace(
        "/api",
        ""
      )}${pdfPath}`;
    } else {
      alert("Failed to create CV.");
    }
  } catch (error) {
    alert("Error creating CV: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};
const updateCV = async () => {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("education", form.education);
    formData.append("experience", form.experience);
    formData.append("skills", form.skills);
    if (form.photo) {
      formData.append("photo", form.photo);
      console.log("FormData includes photo:", form.photo.name);
    } else {
      console.log("No new photo included in FormData");
    }

    const pdfPath = await userStore.updateCV(formData);
    if (pdfPath) {
      await userStore.fetchUser();
      alert("CV updated successfully!");
      window.location.href = `${useRuntimeConfig().public.apiBase.replace(
        "/api",
        ""
      )}${pdfPath}`;
    } else {
      alert("Failed to update CV.");
    }
  } catch (error) {
    alert("Error updating CV: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};
const deleteCV = async () => {
  if (!confirm("Are you sure you want to delete your CV?")) return;
  isSubmitting.value = true;
  try {
    if (await userStore.deleteCV()) {
      alert("CV deleted successfully!");
      Object.keys(form).forEach((key) => (form[key] = ""));
      form.name = userStore.user?.name || "";
      form.email = userStore.user?.email || "";
    } else {
      alert("Failed to delete CV.");
    }
  } catch (error) {
    alert("Error deleting CV: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
