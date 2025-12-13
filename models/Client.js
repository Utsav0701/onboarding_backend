// // models/Client.js
// import mongoose from 'mongoose';

// const fieldSchema = new mongoose.Schema({
//   value: { type: String, default: null },
//   isVerified: { type: Boolean, default: null },

// }, { _id: false });

// // const documentSchema = new mongoose.Schema({
// //   name: String,
// //   path: String,
// //   verified: { type: Boolean, default: false }
// // }, { _id: false });

// const documentSchema = new mongoose.Schema({
//   name: String,
//   url: String,        // Cloudinary URL
//   public_id: String,  // Cloudinary public ID
//   verified: { type: Boolean, default: false }
// }, { _id: false });

// const clientSchema = new mongoose.Schema({
//   name: { type: String, default: null },
//   email: { type: String, default: null },
//   mobile: fieldSchema,
//   referenceBy: { type: String, default: null }, 
//   locationOfInvestor:fieldSchema, 
//   residenceAddress: fieldSchema,
//   occupationOrBusiness: fieldSchema,
//   originOfFunds: fieldSchema,
//   sourceOfWealthOrIncome: fieldSchema,
//   documents: [documentSchema],
//   status : {type :String, default: "Not Submitted"},
//   token: { type: String, default: null }, 
// });

// export default mongoose.model('Client', clientSchema);


// models/Client.js
import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    value: { type: String, default: null },
    isVerified: { type: Boolean, default: null },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, default: null },        // Cloudinary secure URL
    public_id: { type: String, default: null },  // Cloudinary public_id
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, default: null },

    mobile: fieldSchema,
    referenceBy: { type: String, default: null },

    locationOfInvestor: fieldSchema,
    residenceAddress: fieldSchema,
    occupationOrBusiness: fieldSchema,
    originOfFunds: fieldSchema,
    sourceOfWealthOrIncome: fieldSchema,

    documents: [documentSchema],

    status: { type: String, default: "Not Submitted" },
    token: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
