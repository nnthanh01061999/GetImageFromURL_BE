const express = require('express');
const lodash = require('lodash');
const router = express.Router();
const constants = require('../consts')
const DEFAULT_PAGE = constants?.DEFAULT_PAGE;
const DEFAULT_LIMIT = constants?.DEFAULT_LIMIT;
const Model = require('../models/UserModel');
const RoleModel = require('../models/RoleModel');
const filter_field = ['name', 'email']

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
        const data = await Model.find(filter, {password: 0, refresh_token:0})
            .sort({ _id: -1 })
            .skip((size * page) - size)
            .limit(size)
            .populate({ path: 'role', select: ['code', 'name'] })
        const data_ = await Model.find(filter)
            .sort({ _id: -1 })
        const total = data_.length
        return res.status(200).json({ success: true, data: { items: data, total: total } });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
})
//ok
// @route GET api/category
// @desc Get one Category
// @access Public
router.get('/:id', async (req, res) => {
    try {
        const data = await Model.findById(req.params.id, {password: 0, refresh_token :0}).populate({ path: 'role', select: ['code', 'name'] })
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
    const { email, name, nick_name, avatar, birth_day, role } = req.body;
    if (!email || !name || !role)
        return res.status(400).json({ success: false, message: "Missing Information. Check again bro!" });
    try {
        const data_ = await Model.findOne({ email: email })
        if (data_)
            return res.status(400).json({ success: false, message: "Email have been used. Try other." });
        const data__ = await RoleModel.findById(role)
        if (!data__)
            return res.status(400).json({ success: false, message: "Role id not found" });
        const newData = new Model({
            email,
            name,
            nick_name,
            avatar: avatar ? (avatar.startsWith('https://') ? avatar : `http://${avatar}`) : undefined,
            birth_day,
            role,
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
    const { email, name, nick_name, avatar, birth_day, role } = req.body;
    if (!email || !name || !role)
        return res.status(400).json({ success: false, message: "Missing Information. Check again bro!" });
    try {
        const data_ = await Model.findOne({ email: email })
        if (data_)
            return res.status(400).json({ success: false, message: "Email have been used. Try other." });
        const data__ = await RoleModel.findById(role)
        if (!data__)
            return res.status(400).json({ success: false, message: "Role id not found" });
        const newData = {
            email,
            name,
            nick_name,
            avatar: avatar ? (avatar.startsWith('https://') ? avatar : `http://${avatar}`) : undefined,
            birth_day,
            role,
        }
        const data = await Model.findByIdAndUpdate(req.params.id, newData, { new: true });
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