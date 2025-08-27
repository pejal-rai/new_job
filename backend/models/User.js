import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    role: { type: String, default: "user" }, // Role can be 'admin' or 'customer'
});

const User = mongoose.model("User", userSchema);
export default User;
