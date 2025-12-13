// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: (req, file) => {
//     const isPdf = file.mimetype === "application/pdf";
//     console.log("this is  typr",isPdf);
    
//     const name = file.originalname
//       .replace(/\s+/g, "_")
//       .replace(/\.[^/.]+$/, "");

//     return {
//       folder: "client_documents",
//       resource_type: isPdf ? "raw" : "image", // ✅ FIX
//       public_id: `${Date.now()}-${name}`,
//     };
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "application/pdf",
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     console.log("inside allow");
    
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF, JPG, JPEG, PNG files allowed"), false);
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// });

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    const name = file.originalname
      .replace(/\s+/g, "_")
      .replace(/\.[^/.]+$/, "");

    return {
      folder: "client_documents",
      resource_type: isPdf ? "raw" : "image",
      public_id: `${Date.now()}-${name}`,
      access_mode: "public", // ⭐ IMPORTANT
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only PDF, JPG, JPEG, PNG files allowed"), false);
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
