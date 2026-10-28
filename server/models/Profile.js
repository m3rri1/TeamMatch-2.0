const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    firstName: String,

    lastName: String,

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    birthday: String,

    gender: String,

    location: String,

    education: String,

    professionalRole: String,

    industry: String,

    skills: [String],

    subskills: [String],

    otherSkill: String,

    interests: [String],

    otherInterest: String,

    about: String,

    focusType: String,

    focusDescription: String,

    partnershipGender: String,

    photos: [
      {
        type: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);