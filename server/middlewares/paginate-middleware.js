module.exports= (Model)=> async (req,res,next)=>{
const page= parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 5;
const skip = (page -1) * limit;
const sortby = req.query.sortby || 'createdAt';
const order = req.query.order === 'desc' ? -1 : 1;

const [result,total] = await Promise.all([
    Model.find().sort({[sortby]:order}).skip(skip).limit(limit),
    Model.countDocuments()
]);
res.paginatedResult={
    page,
    limit,
    totalPages: Math.ceil(total/limit),
    totalResult: total,
    result
}
next();

}