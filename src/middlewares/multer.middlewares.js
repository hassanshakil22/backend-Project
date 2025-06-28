import multer  from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname ) // todo : change the orignal name to something else as user's file can be overriden
  }
})
 

export const upload = multer(
      { storage: storage }
)