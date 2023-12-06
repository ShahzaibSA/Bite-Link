const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      unique: true,
      required: true
    },
    redirectUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'running'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    visitHistory: [
      {
        timestamp: { type: Number },
        ipAddress: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const Url = mongoose.model('url', urlSchema);

module.exports = Url;
