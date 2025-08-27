<template>
  <div class="container mx-auto p-4">
    <h1 class="text-5xl mb-6 text-[#000000] font-bold">My Profile</h1>

    <!-- Loading State -->
    <div v-if="userStore.isLoading" class="text-center text-gray-500 py-4">
      Loading profile...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center text-red-500 py-4">
      {{ error }}
    </div>

    <!-- Profile Content -->
    <div v-else-if="userStore.user" class="grid grid-cols-1 gap-6">
      <!-- Personal Information Section -->
      <div class="border rounded-lg shadow-md bg-white/75 p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-900">Personal Information</h2>
          <button
            v-if="!editMode"
            @click="editMode = true"
            class="bg-[#b07a29] text-white px-4 py-2 rounded bg-opacity-70 transition hover:-translate-y-1"
          >
            Edit Profile
          </button>
        </div>

        <!-- View Mode -->
        <div v-if="!editMode" class="space-y-4">
          <!-- Profile Image -->
          <div class="mb-4">
            <img
              :src="imageSrc"
              alt="Profile Image"
              class="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <p class="text-gray-600"><strong>Name:</strong> {{ userStore.user.name }}</p>
          <p class="text-gray-600"><strong>Email:</strong> {{ userStore.user.email }}</p>
          <p class="text-gray-600">
            <strong>Phone:</strong> {{ userStore.user.phone || "Not provided" }}
          </p>
        </div>

        <!-- Edit Mode -->
        <form v-else @submit.prevent="updateProfile" class="space-y-4">
          <!-- Profile Image Upload -->
          <div class="flex flex-col">
            <label class="text-gray-600 font-semibold">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="border rounded p-2 mt-1"
            />
            <!-- Preview Image -->
            <div v-if="imagePreview" class="mt-2">
              <img
                :src="imagePreview"
                alt="Image Preview"
                class="w-24 h-24 rounded-full object-cover"
              />
            </div>
          </div>
          <div class="flex flex-col">
            <label class="text-gray-600 font-semibold">Name</label>
            <input
              v-model="editUser.name"
              type="text"
              class="border rounded p-2 mt-1"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-gray-600 font-semibold">Email</label>
            <input
              v-model="editUser.email"
              type="email"
              class="border rounded p-2 mt-1"
              required
            />
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              class="bg-[#b07a29] text-white px-4 py-2 rounded bg-opacity-70 transition hover:-translate-y-1"
            >
              Save Changes
            </button>
            <button
              type="button"
              @click="cancelEdit"
              class="bg-gray-500 text-white px-4 py-2 rounded bg-opacity-70 transition hover:-translate-y-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Password Change Section -->
      <div v-if="message" class="text-green-500 text-center py-2">{{ message }}</div>
      <div v-if="errorMessage" class="text-red-500 text-center py-2">
        {{ errorMessage }}
      </div>
      <div class="border rounded-lg shadow-md bg-white/75 p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Change Password</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="flex flex-col">
            <label class="text-gray-600 font-semibold">Current Password</label>
            <input
              v-model="passwordData.currentPassword"
              type="password"
              class="border rounded p-2 mt-1"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-gray-600 font-semibold">New Password</label>
            <input
              v-model="passwordData.newPassword"
              type="password"
              class="border rounded p-2 mt-1"
              required
            />
          </div>
          <div class="flex flex-col">
            <label class="text-gray-600 font-semibold">Confirm New Password</label>
            <input
              v-model="passwordData.confirmNewPassword"
              type="password"
              class="border rounded p-2 mt-1"
              required
            />
          </div>
          <button
            type="submit"
            class="bg-[#b07a29] text-white px-4 py-2 rounded bg-opacity-70 transition hover:-translate-y-1"
          >
            Update Password
          </button>
        </form>
      </div>

      <!-- Logout Button -->
      <div class="flex justify-end">
        <button
          @click="logout"
          class="bg-red-500 text-white px-4 py-2 rounded bg-opacity-70 transition hover:-translate-y-1"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Not Authenticated -->
    <div v-else class="text-center text-gray-500 py-4">
      Please log in to view your profile
      <NuxtLink to="/login" class="text-blue-500 hover:underline">Login</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const config = useRuntimeConfig();
const loading = ref(false);
const error = ref(null);
const editMode = ref(false);
const message = ref("");
const errorMessage = ref("");
const imagePreview = ref(null);
const imageFile = ref(null);

// Base URL for static assets (without /api)
const staticBaseUrl = config.public.apiBase.replace("/api", "");

const editUser = ref({
  name: "",
  email: "",
  profileImage: "",
});

const passwordData = ref({
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

// Compute image source with default fallback
const imageSrc = computed(() => {
  const src = userStore.user?.profileImage
    ? `${staticBaseUrl}${userStore.user.profileImage}`
    : "/default-avatar.png";
  console.log("Profile Image URL:", src);
  return src;
});

definePageMeta({
  layout: "default",
});

watch(editMode, (newValue) => {
  if (newValue && userStore.user) {
    editUser.value = {
      name: userStore.user.name,
      email: userStore.user.email,
      profileImage: userStore.user.profileImage || "",
    };
    imagePreview.value = userStore.user.profileImage
      ? `${staticBaseUrl}${userStore.user.profileImage}`
      : null;
  }
});

onMounted(async () => {
  if (!userStore.user) {
    const success = await userStore.fetchUser();
    if (!success) {
      error.value = "Failed to load profile data";
    }
  }
  console.log("User data:", userStore.user);
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      errorMessage.value = "Please upload a valid image file";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMessage.value = "Image size must be less than 5MB";
      return;
    }
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};



const updateProfile = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("name", editUser.value.name);
    formData.append("email", editUser.value.email);
    if (imageFile.value) {
      formData.append("profileImage", imageFile.value);
    }

    const response = await $fetch(`${config.public.apiBase}/auth/profile`, {
      method: "PUT",
      body: formData,
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.success) {
      userStore.setUser(response.user);
      message.value = "Profile updated successfully";
      errorMessage.value = "";
      editMode.value = false;
      imagePreview.value = null;
      imageFile.value = null;
    }
  } catch (err) {
    errorMessage.value = err.data?.message || "Failed to update profile";
    message.value = "";
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  editMode.value = false;
  errorMessage.value = "";
  message.value = "";
  imagePreview.value = null;
  imageFile.value = null;
};

const changePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmNewPassword) {
    errorMessage.value = "New passwords do not match";
    return;
  }
  loading.value = true;
  try {
    const response = await $fetch(`${config.public.apiBase}/auth/change-password`, {
      method: "POST",
      body: {
        currentPassword: passwordData.value.currentPassword,
        newPassword: passwordData.value.newPassword,
      },
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (response.success) {
      message.value = "Password updated successfully";
      errorMessage.value = "";
      passwordData.value = {
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      };
    }
  } catch (err) {
    errorMessage.value = err.data?.message || "Failed to change password";
    message.value = "";
  } finally {
    loading.value = false;
  }
};

const logout = async () => {
  try {
    const response = await $fetch(`${config.public.apiBase}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (response.success) {
      userStore.clearUser();
      navigateTo("/login");
    }
  } catch (err) {
    errorMessage.value = err.data?.message || "Failed to logout";
  }
};

onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }
});
</script>

<style scoped>
.container {
  text-align: left;
}

.grid {
  text-align: left;
}

.space-y-4 > * {
  text-align: left;
}

img {
  display: block;
}
</style>
