const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    emailVerified: {
      type: Boolean,
      default: false
    },
    username: {
      type: String,
      trim: true,
      lowercase: true
    },
    fullName: {
      type: String,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid!');
        }
      }
    },
    location: { type: String },
    avatar: {
      url: {
        type: String,
        default: null
      },
      public_id: { type: String }
    },
    password: {
      type: String,
      // required: true,
      // minlength: 5,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        } else if (value.length < 5) {
          throw new Error('Password must be minimum 5 characters!');
        }
      }
    },
    // tokens: [{ token: { type: String, required: true } }]
    // refreshTokens: [String]
    refreshTokens: [{ refreshToken: { type: String } }]
  },
  { timestamps: true }
);

// userSchema.methods.generateAuthToke = async function () {
//   const user = this;
//   const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
//     expiresIn: '5 days'
//   });
//   user.tokens = user.tokens.push(token);
// };

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.refreshTokens;

  return userObject;
};

userSchema.statics.findOneOrCreate = async function findOneOrCreate(email, doc) {
  const self = this;
  const newDocument = {
    fullName: doc.name,
    username: doc.email.split('@')[0],
    email: doc.email,
    emailVerified: doc.email_verified,
    location: doc.location
  };
  try {
    const foundUser = await self.findOne({ email });
    if (foundUser) return foundUser;
    const createUser = await self.create(newDocument);
    createUser.avatar.url = doc.picture;
    createUser.avatar.public_id = `avatar-${createUser._id.toString()}`;
    await createUser.save();
    return createUser;
  } catch (error) {
    return error;
  }
};

const User = mongoose.model('users', userSchema);

module.exports = User;
