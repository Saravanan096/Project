// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

// Create an instance of Express
const app = express();

// Middleware
app.use(express.static(__dirname)); // Serve static files from the current directory
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// MongoDB connection string
const mongoURI = "mongodb://127.0.0.1:27017/sjtravels"; // Update with your MongoDB connection details

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true }, // Ensure email is unique
    password: String, // Store password as plain text (not recommended)
    gender: String,
    state: String,
    street: String,
    city: String,
    district: String,
    pincode: String,
    mobileNumber: String,
    languages: [String]
});

// Create User Model
const User = mongoose.model("User ", UserSchema); // Corrected model name

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html")); // Serve the registration form
});

// Registration route
app.post("/register", async (req, res) => {
    try {
        const { name, email, password, gender, state, street, city, district, pincode, mobileNumber, languages } = req.body;

        const newUser  = new User({
            name,
            email,
            password, // Store plain text password
            gender,
            state,
            street,
            city,
            district,
            pincode,
            mobileNumber,
            languages: Array.isArray(languages) ? languages : [languages]
        });

        await newUser .save();
        console.log("✅ User Registered:", newUser );
        res.redirect("/loginpage.html"); // Redirect to the login page after successful registration
    } catch (error) {
        console.error("❌ Error Registering User:", error);
        if (error.code === 11000) {
            return res.status(400).send("Email already exists.");
        }
        res.status(500).send("Error Registering User");
    }
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body; // Assuming you use email as the username

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && user.password === password) {
            console.log("✅ User Logged In:", user);
            res.redirect("/vechile_selection.html"); // Redirect to vehicle selection page
        } else {
            res.status(401).send("Invalid username or password.");
        }
    } catch (error) {
        console.error("❌ Error Logging In User:", error);
        res.status(500).send("Error Logging In User");
    }
});

// Change Password route
app.post("/change-password", async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists and old password matches
        if (user && user.password === oldPassword) {
            user.password = newPassword; // Update the user's password
            await user.save(); // Save the updated user
            console.log("✅ Password Changed Successfully for:", user.email);
            res.status(200).send("Password changed successfully.");
        } else {
            res.status(401).send("Invalid old password.");
        }
    } catch (error) {
        console.error("❌ Error Changing Password:", error);
        res.status(500).send("Error Changing Password");
    }
});

// Start the server
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});