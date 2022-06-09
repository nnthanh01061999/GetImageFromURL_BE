const express = require('express');
const lodash = require('lodash');
const router = express.Router();
const constants = require('../consts')
const DEFAULT_PAGE = constants?.DEFAULT_PAGE;
const DEFAULT_LIMIT = constants?.DEFAULT_LIMIT;
const Model = require('../models/RoleModel');
const filter_field = ['name', 'code']

// @route GET api/category
// @desc Get all Category
// @access Public
router.get('/', async (req, res) => {
    try {
        const page = req.query.page || DEFAULT_PAGE;
        const size = req.query.size || DEFAULT_LIMIT;

        const params = lodash.pick(req.query, filter_field, undefined)
        const filter = {
            ...params,
            name: {
                '$regex': lodash.get(params, 'name', ''),
                '$options': 'i'
            },
        }
        const data = await Model.find(filter)
            .sort({ _id: -1 })
            .skip((size * page) - size)
            .limit(size)

        const data_ = await await Model.find(filter)
            .sort({ _id: -1 })
        const total = data_.length
        return res.status(200).json({ success: true, data: { items: data, total: total } });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
})

// @route GET api/category
// @desc Get one Category
// @access Public
router.get('/:id', async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        if (!data)
            return res.status(401).json({ success: false, message: "Id not found" });
        return res.status(200).json({ success: true, message: "", data: data });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
})
// @route POST api/category
// @desc Add Category
// @access Private
router.post('/', async (req, res) => {
    const { code, name, description, } = req.body;
    if (!code || !description || !name)
        return res.status(400).json({ success: false, message: "Missing Information. Check again bro!" });
    try {
        const data_ = await Model.findOne({ code: code })
        if (data_)
            return res.status(400).json({ success: false, message: "Code have been used. Try other." });
        const newData = new Model({
            code,
            name,
            description,
        })
        await newData.save();
        return res.status(200).json({ success: true, message: "Success", data: newData });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
})
// @route PUT api/category
// @desc update Category
// @access Private
router.put('/:id', async (req, res) => {
    const { code, name, } = req.body;
    if (!code || !name)
        return res.status(400).json({ success: false, message: "Missing Information. Check again bro!" });
    try {
        const data_ = await Model.findOne({ code: code })
        if (data_)
            return res.status(400).json({ success: false, message: "Code have been used. Try other." });
        const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!data)
            return res.status(400).json({ success: false, message: "Id not found" });
        return res.status(200).json({ success: true, message: "success", data: data });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
})
// @route DELETE api/category
// @desc Delete Category
// @access Private
router.delete('/:id', async (req, res) => {
    try {
        const data = await Model.findByIdAndDelete(req.params.id);
        if (!data)
            return res.status(400).json({ success: false, message: "Id not found" });
        return res.status(200).json({ success: true, message: "Success", data: data });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
})

module.exports = router;