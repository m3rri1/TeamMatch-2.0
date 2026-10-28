const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Profile = require("./models/Profile");
const User = require("./models/User");
const Connection = require("./models/Connection");
const Message = require("./models/Message");

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "teammatch-secret-change-this";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// =========================
// BASIC ROUTE
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "TeamMatch backend is running 🚀",
  });
});

// =========================
// AUTH MIDDLEWARE
// =========================

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

// =========================
// REGISTER
// =========================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      error: "Failed to create account",
    });
  }
});

// =========================
// LOGIN
// =========================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      error: "Failed to login",
    });
  }
});

// =========================
// CURRENT USER
// =========================

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.user._id,
    });

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        profile: profile || null,
      },
    });
  } catch (error) {
    console.error("Current user error:", error.message);

    res.status(500).json({
      error: "Failed to fetch current user",
    });
  }
});

// =========================
// CREATE / UPDATE PROFILE
// =========================

app.post("/api/profiles", authenticate, async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      userId: req.user._id,
      email: req.user.email,
    };

    delete profileData._id;
    delete profileData.createdAt;
    delete profileData.updatedAt;

    const profile = await Profile.findOneAndUpdate(
      {
        userId: req.user._id,
      },
      profileData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await User.findByIdAndUpdate(req.user._id, {
      profile: profile._id,
    });

    res.status(200).json(profile);
  } catch (error) {
    console.error("Profile save error:", error.message);

    res.status(500).json({
      error: "Failed to save profile",
    });
  }
});

// =========================
// GET MY PROFILE
// =========================

app.get("/api/profiles/me", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    console.error("My profile fetch error:", error.message);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});

// =========================
// GET ALL OTHER PROFILES
// =========================

app.get("/api/profiles", authenticate, async (req, res) => {
  try {
    const profiles = await Profile.find({
      userId: {
        $ne: req.user._id,
      },
    }).sort({
      createdAt: -1,
    });

    res.json(profiles);
  } catch (error) {
    console.error("Profiles fetch error:", error.message);

    res.status(500).json({
      error: "Failed to fetch profiles",
    });
  }
});

// =========================
// GET ONE PROFILE
// =========================

app.get("/api/profiles/:id", authenticate, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error.message);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});

// =========================
// GET CONNECTIONS
// =========================

app.get("/api/connections", authenticate, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
    }).sort({
      createdAt: -1,
    });

    res.json(connections);
  } catch (error) {
    console.error("Connections fetch error:", error.message);

    res.status(500).json({
      error: "Failed to fetch connections",
    });
  }
});

// =========================
// SEND CONNECTION REQUEST
// =========================

app.post("/api/connections", authenticate, async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        error: "Profile ID is required",
      });
    }

    const targetProfile = await Profile.findById(profileId);

    if (!targetProfile) {
      return res.status(404).json({
        error: "Profile not found",
      });
    }

    if (String(targetProfile.userId) === String(req.user._id)) {
      return res.status(400).json({
        error: "You cannot connect with yourself",
      });
    }

    const recipientId = targetProfile.userId;

    const existing = await Connection.findOne({
      $or: [
        {
          requester: req.user._id,
          recipient: recipientId,
        },
        {
          requester: recipientId,
          recipient: req.user._id,
        },
      ],
    });

    if (existing) {
      return res.status(200).json({
        message: "Connection already exists",
        connection: existing,
      });
    }

    const connection = await Connection.create({
      requester: req.user._id,
      recipient: recipientId,
      status: "pending",
    });

    res.status(201).json({
      message: "Connection request sent",
      connection,
    });
  } catch (error) {
    console.error("Connection creation error:", error.message);

    res.status(500).json({
      error: "Failed to send connection request",
    });
  }
});

// =========================
// ACCEPT / REJECT REQUEST
// =========================

app.patch("/api/connections/:id", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
      return res.status(400).json({
        error: "Status must be accepted or rejected",
      });
    }

    const connection = await Connection.findOne({
      _id: req.params.id,
      recipient: req.user._id,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({
        error: "Connection request not found",
      });
    }

    connection.status = status;
    await connection.save();

    res.json({
      message:
        status === "accepted"
          ? "Connection accepted"
          : "Connection rejected",
      connection,
    });
  } catch (error) {
    console.error("Connection update error:", error.message);

    res.status(500).json({
      error: "Failed to update connection",
    });
  }
});

// =========================
// REMOVE CONNECTION
// =========================

app.delete("/api/connections/:id", authenticate, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      status: "accepted",
      $or: [
        { requester: req.user._id },
        { recipient: req.user._id },
      ],
    });

    if (!connection) {
      return res.status(404).json({
        error: "Accepted connection not found",
      });
    }

    await Connection.deleteOne({
      _id: connection._id,
    });

    res.json({
      message: "Connection removed",
    });
  } catch (error) {
    console.error("Remove connection error:", error.message);

    res.status(500).json({
      error: "Failed to remove connection",
    });
  }
});

// =========================
// CHECK ACCEPTED CONNECTION
// =========================

const requireAcceptedConnection = async (
  currentUserId,
  otherUserId
) => {
  return Connection.findOne({
    status: "accepted",
    $or: [
      {
        requester: currentUserId,
        recipient: otherUserId,
      },
      {
        requester: otherUserId,
        recipient: currentUserId,
      },
    ],
  });
};

// =========================
// GET CHAT MESSAGES
// =========================

app.get("/api/messages/:userId", authenticate, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const connection = await requireAcceptedConnection(
      req.user._id,
      otherUserId
    );

    if (!connection) {
      return res.status(403).json({
        error: "You can only chat with a connected user",
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          recipient: otherUserId,
        },
        {
          sender: otherUserId,
          recipient: req.user._id,
        },
      ],
    }).sort({
      createdAt: 1,
    });

    res.json(messages);
  } catch (error) {
    console.error("Messages fetch error:", error.message);

    res.status(500).json({
      error: "Failed to fetch messages",
    });
  }
});

// =========================
// SEND CHAT MESSAGE
// =========================

app.post("/api/messages", authenticate, async (req, res) => {
  try {
    const { recipientId, text } = req.body;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({
        error: "Recipient and message are required",
      });
    }

    if (String(recipientId) === String(req.user._id)) {
      return res.status(400).json({
        error: "You cannot message yourself",
      });
    }

    const connection = await requireAcceptedConnection(
      req.user._id,
      recipientId
    );

    if (!connection) {
      return res.status(403).json({
        error: "You can only chat with a connected user",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
    });

    res.status(201).json({
      message,
    });
  } catch (error) {
    console.error("Message send error:", error.message);

    res.status(500).json({
      error: "Failed to send message",
    });
  }
});
// =========================
// GET UNREAD MESSAGE COUNT
// =========================

app.get("/api/messages/unread/count", authenticate, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Unread count error:", error.message);

    res.status(500).json({
      error: "Failed to get unread message count",
    });
  }
});

// =========================
// MARK CHAT MESSAGES AS READ
// =========================

app.patch(
  "/api/messages/:userId/read",
  authenticate,
  async (req, res) => {
    try {
      const otherUserId = req.params.userId;

      const connection = await requireAcceptedConnection(
        req.user._id,
        otherUserId
      );

      if (!connection) {
        return res.status(403).json({
          error: "You can only read messages from a connected user",
        });
      }

      await Message.updateMany(
        {
          sender: otherUserId,
          recipient: req.user._id,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      res.json({
        message: "Messages marked as read",
      });
    } catch (error) {
      console.error(
        "Mark messages read error:",
        error.message
      );

      res.status(500).json({
        error: "Failed to mark messages as read",
      });
    }
  }
);
// =========================
// DATABASE
// =========================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");

    app.listen(PORT, () => {
      console.log(
        `TeamMatch server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed ❌");
    console.error(error.message);
  });