const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");
const { listContacts, updateContactStatus } = require("../controllers/contactController");

// Admin-only. (Public submission lives in routes/publicRouter.js.)
// Mounted under the JWT-protected main router, so requireAdmin runs after auth.
router.get("/all", requireAdmin, listContacts);
router.patch("/:id/status", requireAdmin, updateContactStatus);

module.exports = router;
