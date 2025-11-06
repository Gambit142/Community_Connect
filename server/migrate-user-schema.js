const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configure dotenv to load environment variables (assuming your .env is configured)
dotenv.config({ path: './.env' }); 

// 1. Define the User Schema/Model locally for this script (or import it)
// We must use the same schema structure as in User.js.
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ['member', 'admin'], required: true, default: 'member' },
    userType: { type: String, enum: ['individual', 'company', 'organization'], required: true },
    bio: { type: String, required: false },
    location: { type: String, required: false },
    interests: { type: [String], required: false },
    profilePic: { type: String, required: false },
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Date, required: false },
    organizationDetails: { type: Object, required: false },
    verificationToken: { type: String, required: false },
    isVerified: { type: Boolean, default: false, required: true },
    // Ensure this field matches the definition in User.js
    attendedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { timestamps: true });

userSchema.index({ attendedEvents: 1 });
const User = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Database Connection Logic (based on db.js)
const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TEST : process.env.MONGO_URI_DEV;
    if (!uri) {
      throw new Error("MongoDB URI environment variable is not set.");
    }
    await mongoose.connect(uri);
    console.log('MongoDB connected for migration.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};


// 3. Migration Logic
const migrateSchema = async () => {
    try {
        await connectDB();
        
        console.log('Starting migration: Adding missing attendedEvents field to existing users...');

        // Find all documents where the attendedEvents field does NOT exist
        const result = await User.updateMany(
            { attendedEvents: { $exists: false } },
            { $set: { attendedEvents: [] } }
        );

        console.log('Migration successful!');
        console.log(`Matched ${result.matchedCount} users.`);
        console.log(`Modified ${result.modifiedCount} users.`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

migrateSchema();