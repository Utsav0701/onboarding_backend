// Add client logic here
import Client from "../models/Client.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
import { sendMail } from "../utils/sendMail.js";
import { generateToken } from "../helper/generateToken.js";
import cloudinary from "../config/cloudinary.js";

// // Get __dirname in ES6
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// ✅ 1. Add Client + Send Upload Link
// import dotenv from "dotenv";
// dotenv.config();

export const addClient = async (req, res) => {
  try {
    const { name, email, referenceBy, documents } = req.body;

    const newClient = new Client({
      name,
      email,
      referenceBy,
      locationOfInvestor: {},
      residenceAddress: {},
      occupationOrBusiness: {},
      originOfFunds: {},
      sourceOfWealthOrIncome: {},
      mobile: {},
      documents: documents.map((doc) => ({
        name: doc,
        url: null,
        public_id: null,
        verified: false,
      })),
    });

    const savedClient = await newClient.save();

    // Generate token for the client
    const token = generateToken(savedClient._id);
    savedClient.token = token;
    await savedClient.save();

    // Use frontend URL from .env
    const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL; // e.g., https://yourfrontend.com
    const uploadLink = `${FRONTEND_BASE_URL}/user/form/${token}`;

    const html = `
      <p>Dear ${savedClient.name},</p>
      <p>Many thanks for your registration.</p>
      <p>Please find below checklist which is applicable to NRI & Foreign Nationals, as Indian Residents are not allowed to invest into Gift Fund.</p>

      <h4>Details Required:</h4>
      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ____________________________</li>
        <li><strong>Email ID:</strong> ____________________________</li>
        <li><strong>Mobile:</strong> ____________________________</li>
        <li><strong>Location of Investor:</strong> ____________________________</li>
        <li><strong>Residence Address:</strong> ____________________________</li>
        <li><strong>Occupation/Business:</strong> ____________________________</li>
        <li><strong>Origin of Funds:</strong> ____________________________</li>
        <li><strong>Source of Wealth or Income:</strong> ____________________________</li>
      </ul>

      <h4>Documents Required:</h4>
      <p>Please provide <strong>Notarized</strong> copies of the documents listed below:</p>
      <ul>
        ${savedClient.documents.map((doc) => `<li>${doc.name}</li>`).join("")}
      </ul>
      <p>Notarization can be done by a lawyer, bank official, notary, actuary, accountant, or director.</p>

      <p>Kindly upload the documents using the link below:</p>
      <p><a href="${uploadLink}">Click here to submit your form</a></p>

      <p>Thank you!</p>
    `;

    await sendMail(
      email,
      "Onboarding Checklist for an Individual Investor",
      html
    );

    res.status(201).json({ message: "Client added and mail sent", client: savedClient });
  } catch (error) {
    console.error("Add client error:", error);
    res.status(500).json({ message: "Error adding client" });
  }
};  


// ✅ 2. Get All Clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients" });
  }
};

// ✅ 3. Get Single Client
export const getClient = async (req, res) => {
  try {
    let clientId = req.params.id;
    if (clientId === undefined) {
      clientId = req.id;
    }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    console.error("Get client error:", error);
    res.status(500).json({ message: "Failed to fetch client" });
  }
};

// ✅ 4. Delete Client + Files
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    for (const doc of client.documents) {
      if (doc.public_id) {
        try {
          await cloudinary.uploader.destroy(doc.public_id);
        } catch (err) {
          console.error(`Failed to delete ${doc.name} from Cloudinary`, err);
        }
      }
    }

    await Client.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Client and files deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
};

// ✅ 5. Update Client and Documents
export const updateClientAndDocuments = async (req, res) => {
  try {
    const clientId = req.id;
    const files = req.files || [];

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    client.status = "Pending"; // Reset status on update
    const uploadedDocsList = [];

    // Update documents if new files are uploaded
    if (files.length > 0) {
      const updatedDocuments = await Promise.all(
        client.documents.map(async (doc) => {
          const matchingFile = files.find(
            (file) => file.fieldname === doc.name
          );
          if (matchingFile) {
            // Delete old file from Cloudinary
            if (doc.public_id) {
              try {
                await cloudinary.uploader.destroy(doc.public_id);
              } catch (err) {
                console.error(`Failed to delete old file ${doc.name}:`, err);
              }
            }

            uploadedDocsList.push(doc.name);

            return {
              ...doc.toObject(),
              url: matchingFile.path, // Cloudinary URL
              public_id: matchingFile.filename, // Cloudinary public ID
              verified: false,
            };
          }
          return doc;
        })
      );

      client.documents = updatedDocuments;
    }

    // Update other client fields
    const fieldsToUpdate = [
      "mobile",
      "locationOfInvestor",
      "residenceAddress",
      "occupationOrBusiness",
      "originOfFunds",
      "sourceOfWealthOrIncome",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        client[field] = { value: req.body[field], isVerified: false };
      }
    });

    client.token = null;
    await client.save();

    // Send confirmation email
    const subject = "Confirmation: Documents Submitted Successfully";
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${client.name || "Client"},</h2>
        <p>Thank you for submitting your details. We have received the following documents:</p>
        <ul>
          ${
            uploadedDocsList.length > 0
              ? uploadedDocsList.map((doc) => `<li>${doc}</li>`).join("")
              : "<li>No documents uploaded</li>"
          }
        </ul>
        <p>We will review your submission shortly.</p>
        <p>Best regards,<br/>Your Company Team</p>
      </div>
    `;

    await sendMail(client.email, subject, html, client._id);

    res.status(200).json({
      message: "Client updated successfully. Confirmation email sent.",
      client,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// ✅ 3. Resend Upload Link for Rejected Fields & Documents

export const resendUploadLink = async (req, res) => {
  try {
    const clientId = req.body.clientId;
    const { rejected, accepted } = req.body;

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Handle accepted fields
    if (accepted.acceptedFields.length > 0) {
      accepted.acceptedFields.forEach((field) => {
        if (field in client) {
          client[field].isVerified = true;
        }
      });
    }

    // Handle accepted documents
    if (accepted.acceptedDocs.length > 0) {
      accepted.acceptedDocs.forEach((docName) => {
        const doc = client.documents.find((d) => d.name === docName);
        if (doc) doc.verified = true;
      });
    }

    // Handle rejected fields
    if (rejected.rejectedFields.length > 0) {
      rejected.rejectedFields.forEach((field) => {
        if (field in client) client[field].isVerified = null;
      });
    }

    // Handle rejected documents
    if (rejected.rejectedDocs.length > 0) {
      rejected.rejectedDocs.forEach((docName) => {
        const doc = client.documents.find((d) => d.name === docName);
        if (doc) doc.verified = null;
      });
    }

    // Update client status
    const hasRejections =
      rejected.rejectedFields.length > 0 || rejected.rejectedDocs.length > 0;
    client.status = hasRejections ? "Not Submitted" : "Approved";

    // Generate token for client
    const token = generateToken(client._id);
    client.token = token;
    await client.save();

    // Use frontend URL from environment variable
    const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL; // e.g., https://yourfrontend.com
    const uploadLink = `${FRONTEND_BASE_URL}/user/form/${token}`;

    let html = "";

    if (hasRejections) {
      const fieldList = rejected.rejectedFields
        .map((f) => `<li>${f}</li>`)
        .join("");
      const docList = rejected.rejectedDocs
        .map((d) => `<li>${d}</li>`)
        .join("");

      const htmlSections = [`<h2>Hello ${client.name},</h2>`];

      if (fieldList) {
        htmlSections.push(`
          <p>The following fields need to be re-entered:</p>
          <ul>${fieldList}</ul>
        `);
      }

      if (docList) {
        htmlSections.push(`
          <p>The following documents need to be re-uploaded:</p>
          <ul>${docList}</ul>
        `);
      }

      htmlSections.push(`
        <p>Please complete the missing items using the following link:</p>
        <a href="${uploadLink}">Click here to re-submit your form</a>
        <p>Regards,<br/>Admin Team</p>
      `);

      html = htmlSections.join("\n");

      await sendMail(client.email, "Re-Submission Required", html);
    } else {
      html = `
        <h2>Hello ${client.name},</h2>
        <p>Congratulations! Your account verification has been successfully completed.</p>
        <p>All your submitted information and documents have been approved.</p>
        <p>You can now access all features of your account.</p>
        <p>Regards,<br/>Admin Team</p>
      `;

      await sendMail(client.email, "Account Verification Approved", html);
    }

    res.status(200).json({ message: "Email sent to client", status: client.status });
  } catch (error) {
    console.error("Resend upload link error:", error);
    res.status(500).json({ message: "Failed to resend email" });
  }
};

