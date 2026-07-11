const express = require("express");
const router = express.Router();
const { listStore, purchase, myRedemptions } = require("../controllers/storeController");

router.get("/", listStore);
router.post("/purchase", purchase);
router.get("/redemptions", myRedemptions);

module.exports = router;
