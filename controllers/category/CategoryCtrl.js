const expressAsyncHandler = require("express-async-handler");
const Category = require('../../models/Category/category')
//create
const createCategoryCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const category = await Category.create({
            user: req.user._id,
            title: req.body.title,
        });
        res.json(category)
    } catch (error) {
        res.json(error);
        
    }
})

//fetch All
const fetchCategoriesCtrl = expressAsyncHandler(async (req, res) => {
    try {
        const categories = await Category.find({}).populate("user").sort("-createAt");
        res.json(categories)
    } catch (error) {
        res.json(error)
    }
})

//fetch cate
const fetchCategoryCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id).populate("user").sort("-createAt");
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})

//update Category
const updateCategoryCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByIdAndUpdate(id, {
            title: req?.body?.title
        }, {
            new: true,
            runValidators: true
        });
        res.json(category)
    } catch (error) {

    }
})

//delete Category
const deleteCategory = expressAsyncHandler(async (req, res) => {
    // res.json("deleteCategory");
    const { id } = req.params
    try {
        const category = await Category.findByIdAndDelete(id);
        res.json(category)
    } catch (error) {
        res.json(error)
    }
})
module.exports = { createCategoryCtrl, fetchCategoriesCtrl, fetchCategoryCtrl, updateCategoryCtrl, deleteCategory }