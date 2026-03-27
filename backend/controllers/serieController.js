const Serie = require("../models/Serie");

exports.getAll = async (req, res) => {
  try {
    const series = await Serie.find();
    res.json(series);
  } catch (error) {
    res.status;
  }
};

exports.get = async (req, res) => {
  try {
    const serie = await Serie.findById(req.params.id);
    res.json(serie);
  } catch (error) {
    res.status;
  }
};

exports.create = async (req, res) => {
  try {
    const serie = new Serie(req.body);
    await serie.save();
    res.json(serie);
  } catch (error) {
    res.status;
  }
};

exports.update = async (req, res) => {
  try {
    await Serie.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Serie updated" });
  } catch (error) {
    res.status;
  }
};

exports.delete = async (req, res) => {
  try {
    await Serie.findByIdAndDelete(req.params.id);
    res.json({ message: "Serie deleted" });
  } catch (error) {
    res.status;
  }
};
