console.log("Store route loaded");
const express = require("express");
const router = express.Router();

const Store = require("../models/Store");

router.post("/create", async (req, res) => {

  try {

    const { name, latitude, longitude } = req.body;

    const store = new Store({
      name,
      latitude,
      longitude
    });

    await store.save();

    res.json({
      message: "Store created successfully",
      store
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;