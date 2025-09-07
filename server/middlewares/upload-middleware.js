const multer = require('multer');
const path = require('path');
//file-type
const fileFilter= (req,file,cb)=>{
    const ext = path.extname(file.originalname).toLowerCase();

    const allowed = ['.png','.jpg','.jpeg','.webp'];
    if(!allowed.includes(ext)){
        return cb(new Error('only images allowed (.jpg,.png,.jpeg)'),false);
    }
    cb(null,true)
}

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
      cb(null,'uploads/products');  
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}_${file.originalname}`)
    }
})

const MB = 1024 * 1024;
const upload= multer({
  storage,
  fileFilter,
  limits:{fileSize: 10*MB} //2mb  
})
module.exports = {upload}